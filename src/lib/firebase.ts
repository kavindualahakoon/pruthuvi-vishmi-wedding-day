// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDGrGBCRVvneMiFHzTtRpfeuw-V8rYtRU",
  authDomain: "pruthuvi-vishmi-wedding-day.firebaseapp.com",
  projectId: "pruthuvi-vishmi-wedding-day",
  storageBucket: "pruthuvi-vishmi-wedding-day.firebasestorage.app",
  messagingSenderId: "260252741598",
  appId: "1:260252741598:web:98ab6145730b7a6f7eb74f",
  measurementId: "G-RPTXP3GDXJ"
};

// Initialize Firebase
// We use getApps to ensure we don't initialize the app multiple times in Next.js development
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
