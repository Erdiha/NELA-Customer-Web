// src/firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCIJfIlDJvx_tomr2hQnGlpgMB84G3KYlI",
  authDomain: "personal-rideshare.firebaseapp.com",
  projectId: "personal-rideshare",
  storageBucket: "personal-rideshare.firebasestorage.app",
  messagingSenderId: "1071735058811",
  appId: "1:1071735058811:web:cf71d53fd684a25d94cdde",
  measurementId: "G-QC0604B68G",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
