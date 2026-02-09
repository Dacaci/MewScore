import { useState, useEffect } from 'react';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

export function useGoogleAuth() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    setIsReady(true);
  }, []);

  const signIn = async (): Promise<{ idToken: string } | null> => {
    try {
      await GoogleSignin.hasPlayServices();

      // Force sign out before sign in to always show account picker
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore if not signed in
      }

      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          return { idToken };
        }
      }
      return null;
    } catch (error: unknown) {
      const typedError = error as { code?: string };
      if (typedError.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign in');
      } else if (typedError.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in already in progress');
      } else if (typedError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error('Google Sign-In error:', error);
      }
      return null;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  };

  return {
    signIn,
    signOut,
    isReady,
  };
}
