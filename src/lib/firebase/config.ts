import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBQKMku0yyCVONjHN_4FZGlpp13qqODuP8",
  authDomain: "iqra-c13eb.firebaseapp.com",
  projectId: "iqra-c13eb",
  storageBucket: "iqra-c13eb.firebasestorage.app",
  messagingSenderId: "376390244158",
  appId: "1:376390244158:web:8c4ea8702925ec4ab6fe6f",
  measurementId: "G-S9TVHDVVB4"
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
