"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"; // Import Firebase User type
import { auth } from '../lib/firebase';

// Define your user type, extending FirebaseUser for type safety
interface User extends FirebaseUser {
    displayName: string | null; // Changed from string | null | undefined to string | null
    email: string | null; // Updated to match FirebaseUser type, removed undefined
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null); // Use your User type here
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user as User); // Cast to User type
            setLoading(false);

            if (!loading) {
                if (user) {
                    router.push("/dashboard");
                } else {
                    router.push("/signin");
                }
            }
        });

        return () => unsubscribe();
    }, [loading, router]);

    return { user, loading };
}