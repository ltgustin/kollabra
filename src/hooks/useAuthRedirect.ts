"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from './useAuth';

export function useAuthRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/signin'); // Redirect if user is authenticated
            }
        }
    }, [loading, user, router]);
}
