// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with better offline handling
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)");

// Configure Firestore for better offline handling
if (import.meta.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase initialized in development mode');
}

export const functions = getFunctions(app);

// Only initialize analytics in production
export const analytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? getAnalytics(app) : null;

// Export app configuration
export const config = {
  appName: import.meta.env.VITE_APP_NAME || 'Billr',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  paymentLinkPrefix: `${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/pay`,
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  invoiceLimitFree: Number(import.meta.env.VITE_INVOICE_LIMIT_FREE) || 5,
  sessionTimeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
};

export default app; 