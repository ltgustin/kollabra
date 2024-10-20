import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export const checkUserInDatabase = async (uid: string) => {
    const userDoc = doc(db, 'users', uid);
    const docSnapshot = await getDoc(userDoc);
    return docSnapshot.exists(); // Returns true if the user exists
};

interface UserProfile {
    id: string;
    displayName: string;
    onboarded: boolean;
    createdAt: Date;
}

export const createUserProfile = async (uid: string, displayName: string): Promise<void> => {
    const userDoc = doc(db, 'users', uid);
    const userProfile: UserProfile = {
        id: uid,
        displayName,
        onboarded: true,
        createdAt: new Date(),
    };
    await setDoc(userDoc, userProfile);
};
