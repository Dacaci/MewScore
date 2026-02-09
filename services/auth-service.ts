import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, collection, query, where, getDocs, updateDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserGender } from '@/types/firebase';

const DEFAULT_SCANS_REMAINING = 3;

export interface OnboardingData {
  gender?: UserGender | null;
  age?: number | null;
}

export async function signInWithGoogle(idToken: string, onboardingData?: OnboardingData): Promise<FirebaseUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const firebaseUser = userCredential.user;

  // Check if user exists in Firestore, if not create profile
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) {
    const userData: User = {
      email: firebaseUser.email ?? '',
      createdAt: Timestamp.now(),
      scansRemaining: DEFAULT_SCANS_REMAINING,
      isPremium: false,
      detailedReportsRemaining: 0,
      // Initialize streak & analytics
      currentStreak: 0,
      longestStreak: 0,
      totalScans: 0,
    };

    // Add gender and age from onboarding if provided
    if (onboardingData?.gender) {
      userData.gender = onboardingData.gender;
    }
    if (onboardingData?.age) {
      userData.age = onboardingData.age;
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
  }

  return firebaseUser;
}

export async function registerUser(email: string, password: string, onboardingData?: OnboardingData): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const userData: User = {
    email: firebaseUser.email ?? email,
    createdAt: Timestamp.now(),
    scansRemaining: DEFAULT_SCANS_REMAINING,
    isPremium: false,
    detailedReportsRemaining: 0,
    // Initialize streak & analytics
    currentStreak: 0,
    longestStreak: 0,
    totalScans: 0,
  };

  // Add gender and age from onboarding if provided
  if (onboardingData?.gender) {
    userData.gender = onboardingData.gender;
  }
  if (onboardingData?.age) {
    userData.age = onboardingData.age;
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  return firebaseUser;
}

export async function loginUser(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserData(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
}

export interface UpdateProfileData {
  gender?: UserGender | null;
  age?: number | null;
}

export async function updateUserProfile(userId: string, data: UpdateProfileData): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const updates: Partial<Record<keyof User, unknown>> = {};
  if (data.gender !== undefined) updates.gender = data.gender;
  if (data.age !== undefined) updates.age = data.age;
  if (Object.keys(updates).length > 0) {
    await updateDoc(userRef, updates);
  }
}

export async function decrementScansRemaining(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data() as User;
    if (userData.isPremium) {
      return userData.scansRemaining;
    }

    const newCount = Math.max(0, userData.scansRemaining - 1);
    transaction.update(userRef, { scansRemaining: newCount });
    return newCount;
  });
}

export async function applyOneTimePurchase(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) return;

    const userData = userDoc.data() as User;
    transaction.update(userRef, {
      scansRemaining: userData.scansRemaining + 15,
      detailedReportsRemaining: userData.detailedReportsRemaining + 1,
    });
  });
}

export async function applySubscription(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    isPremium: true,
    scansRemaining: 9999,
  });
}

export async function decrementDetailedReports(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);

  return runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) return 0;

    const userData = userDoc.data() as User;
    const newCount = Math.max(0, userData.detailedReportsRemaining - 1);
    transaction.update(userRef, { detailedReportsRemaining: newCount });
    return newCount;
  });
}

// Temporary function to upgrade a user to Premium (for testing)
export async function upgradeUserToPremium(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('User not found:', email);
      return false;
    }

    const userDocRef = querySnapshot.docs[0].ref;
    await updateDoc(userDocRef, {
      isPremium: true,
      scansRemaining: 9999,
    });

    console.log('User upgraded to Premium:', email);
    return true;
  } catch (error) {
    console.error('Error upgrading user:', error);
    return false;
  }
}
