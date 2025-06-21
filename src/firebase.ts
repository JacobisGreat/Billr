// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC24AQjWltHpzqj_qSiaHJRUROjES2zN_Y",
  authDomain: "billr-7f713.firebaseapp.com",
  projectId: "billr-7f713",
  storageBucket: "billr-7f713.firebasestorage.app",
  messagingSenderId: "579276646722",
  appId: "1:579276646722:web:eaec24c68f875b7265c0db",
  measurementId: "G-ZNRM08NEDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Try default database first
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app; 