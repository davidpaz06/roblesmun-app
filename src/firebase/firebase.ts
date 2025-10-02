import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTm9FiFWT-kVbqp8z3JvcT4_gNmz8v5r8",
  authDomain: "roblesmun-519a6.firebaseapp.com",
  projectId: "roblesmun-519a6",
  storageBucket: "roblesmun-519a6.firebasestorage.app",
  messagingSenderId: "1081022181873",
  appId: "1:1081022181873:web:ed20c9a40736367a8a9450",
  measurementId: "G-E1VQVVX6WL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
