"use client";

import { signInWithPopup, TwitterAuthProvider } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from '../../lib/firebase';
import styles from './SignIn.module.scss';

const provider = new TwitterAuthProvider();

const SignIn = () => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter(); // Call useRouter directly in the component body

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // If the component is not mounted yet or router is not available, return null
    if (!isMounted || !router) {
        return null; // or a loading spinner
    }

    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            // This gives you a Twitter Access Token. You can use it for further Twitter API interactions.
            const credential = TwitterAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const secret = credential.secret;

            // The signed-in user info.
            const user = result.user;

            // Navigate to the dashboard or home page after a successful sign-in.
            router.push("/dashboard");
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    };

    return (
        <div className={styles["sign-in-container"]}>
            <button onClick={handleSignIn}>Sign In</button>
        </div>
    );
};

export default SignIn;
