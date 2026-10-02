// Firebase SDK for server-side (RSC/route handlers) reads using client-safe config.
// Does NOT contain Admin credentials. Use for public server-rendered reads.

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./client";

const SERVER_APP_NAME = "nxtive-server-read";

export const serverApp =
  getApps().find((a: any) => a.name === SERVER_APP_NAME) ||
  initializeApp(firebaseConfig, SERVER_APP_NAME);

export const serverDb = getFirestore(serverApp);
