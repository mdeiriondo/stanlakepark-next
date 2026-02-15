/**
 * Firebase configuration and initialization.
 * This file should be located at /lib/firebase.ts
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'stanlake-park';

/**
 * Ensures user is authenticated before performing Firestore operations.
 */
const initAuth = async () => {
  try {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  } catch (e) {
    console.error("Auth initialization failed:", e);
  }
};

initAuth();

export { db, auth, appId };