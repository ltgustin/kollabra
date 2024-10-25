"use client"; 

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkUserInDatabase, createUserProfile } from '../../lib/firebase'; // Import Firebase functions
import styles from './Dashboard.module.scss';
import Link from 'next/link';
import OnboardingModal from '../../components/OnboardingModal';
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isOnboarding, setIsOnboarding] = useState(false);

    console.log(user);

    useEffect(() => {
        const checkUser = async () => {
            if (loading) return; // Wait until loading is complete
            if (user) {
                const userExists = await checkUserInDatabase(user.uid); // Check if user exists

                console.log('EXIST CHECK: '+userExists);

                if (!userExists) {
                    console.log('DOES NOT!');
                    setIsOnboarding(true);
                }
            } else {
                router.push('/signin');
            }
        };
        checkUser();
    }, [user, loading]); // Added loading to the dependency array

    const handleOnboardingComplete = async (accountType) => {
        // create user profile with account type
        await createUserProfile(user?.uid, user?.displayName, accountType, user?.photoURL);
        // Close the onboarding modal
        setIsOnboarding(false);
        // Redirect to the user's profile page
        window.location.href = `/profile/${user?.displayName}`; 
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator
    }

    return (
        <div className={styles["dashboard-container"]}>
            <h1>Welcome to the Dashboard!</h1>
            {user ? (
                <div>
                    USER LOGGED IN!
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
            { isOnboarding && (
                <OnboardingModal 
                    open={isOnboarding}
                    onComplete={handleOnboardingComplete} 
                    onClose={() => setIsOnboarding(false)}
                />
            )}
        </div>
    );
}
