/**
 * Script to upgrade a user to Premium
 *
 * Usage: Run this temporarily in the app or via Node.js with Firebase Admin SDK
 *
 * For Firebase Console (easiest method):
 * 1. Go to https://console.firebase.google.com
 * 2. Select project: glowscore-f3ed7
 * 3. Go to Firestore Database
 * 4. Find the users collection
 * 5. Find document with email: "banlechomeur@gmail.com"
 * 6. Edit isPremium from false to true
 * 7. Save
 */

import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export async function upgradeUserToPremium(email: string): Promise<boolean> {
  try {
    // Query user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('User not found:', email);
      return false;
    }

    // Update the first matching document
    const userDoc = querySnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      isPremium: true,
      scansRemaining: 9999, // Unlimited scans
    });

    console.log('User upgraded to Premium:', email);
    return true;
  } catch (error) {
    console.error('Error upgrading user:', error);
    return false;
  }
}

// To use: call upgradeUserToPremium('banlechomeur@gmail.com')
