// SERVER-ONLY. Firebase Admin SDK (privileged access: full Firestore/Auth/Storage control).
// Must never be imported from any file under app/(storefront) client components.
// Uses FIREBASE_ADMIN_* secrets from process.env — never NEXT_PUBLIC_.
import "server-only";

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  // In development/emulator without service account, initialize with project ID only
  if (!clientEmail || !privateKey) {
    console.warn(
      "[firebase-admin] No service account credentials found. " +
        "Initializing with project ID only — some operations may fail."
    );
    return initializeApp({ projectId });
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

const adminApp = getAdminApp();

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export { adminApp };
