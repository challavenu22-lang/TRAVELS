import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyApiKeyForDevelopment",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "manivtha-tours.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "manivtha-tours",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "manivtha-tours.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
