// Firebase CLIENT SDK — safe for browser. Uses NEXT_PUBLIC_* env vars.
// Initializes app, auth, firestore, storage, and analytics for client-side use.

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCOIT5CUIPXQUI3ufSXdqt7koKwxAx2SxI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nxtive.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nxtive",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nxtive.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "529831045516",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:529831045516:web:f878a373e54394dc9e0ea9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-G9CY0CB99E",
};

// Initialize Firebase once across client hot-reloads
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported: boolean) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics might not be supported in certain browser modes (e.g. cookies disabled)
    });
}

export { analytics };
