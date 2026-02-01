import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthState } from '@/types/firebase';
import { getUserData, loginUser, logoutUser, registerUser, signInWithGoogle } from '@/services/auth-service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userId: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    const userData = await getUserData(firebaseUser.uid);
    setState({
      user: userData,
      userId: firebaseUser.uid,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setState({
          user: null,
          userId: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const firebaseUser = await loginUser(email, password);
      await fetchUserData(firebaseUser);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const firebaseUser = await registerUser(email, password);
      await fetchUserData(firebaseUser);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const firebaseUser = await signInWithGoogle(idToken);
      await fetchUserData(firebaseUser);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await logoutUser();
    setState({
      user: null,
      userId: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refreshUserData = async () => {
    if (state.userId) {
      const userData = await getUserData(state.userId);
      setState((prev) => ({ ...prev, user: userData }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUserData,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
