'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up.
 * Creates the user in Firebase Auth and seeds their profile in Firestore.
 */
export async function initiateEmailSignUp(authInstance: Auth, db: Firestore, email: string, password: string): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  const user = userCredential.user;
  const userRef = doc(db, 'users', user.uid);
  
  // Seed the user profile document in Firestore and AWAIT it to ensure login works immediately after
  await setDoc(userRef, {
    id: user.uid,
    email: user.email,
    displayName: email.split('@')[0],
    themePreference: 'light',
    createdAt: serverTimestamp(),
  });
  
  return userCredential;
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate sign-out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}
