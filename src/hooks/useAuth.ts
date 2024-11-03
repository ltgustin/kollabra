"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth"; // Import Firebase User type
import { auth } from '../lib/firebase';

// Define your user type, extending FirebaseUser for type safety
interface User extends FirebaseUser {
    displayName: string | null; // Changed from string | null | undefined to string | null
    slug: string | null;
    email: string | null; // Updated to match FirebaseUser type, removed undefined
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Sign out error:", error); // Handle errors
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user as User); // Cast to User type
            setLoading(false);
            setIsAuthenticated(!!user);

            // console.log(user);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading, isAuthenticated, signOut };
}
