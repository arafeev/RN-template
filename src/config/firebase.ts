import firebase from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

// Initialize Firebase - you'll need to replace these values with your own from Firebase Console
const firebaseConfig = {
    // Your web app's Firebase configuration
    // You'll get these values from your Firebase Console
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Get the already initialized app instance
const app = firebase.app();

// Initialize Firestore
export const db = getFirestore();

// Initialize Auth
export const auth = getAuth();

export default app; 