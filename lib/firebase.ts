import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQnACKNrochLbH8w9pyAhswhhHtJL8ak8",
  authDomain: "uvenue.firebaseapp.com",
  projectId: "uvenue",
  storageBucket: "uvenue.firebasestorage.app",
  messagingSenderId: "1089949969355",
  appId: "1:1089949969355:web:45f861c3515c31b8d6e44e",
  measurementId: "G-J3WS11W32F"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only on client-side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
