"use client"; 

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { checkUserInDatabase, createUserProfile } from '../../lib/firebase'; // Import Firebase functions
import styles from './Dashboard.module.scss';
import OnboardingModal from '../../components/OnboardingModal';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [isOnboarding, setIsOnboarding] = useState(false);

    console.log(user);

    useEffect(() => {
        const checkUser = async () => {
            if (user) {
                const userExists = await checkUserInDatabase(user.uid); // Check if user exists

                console.log('EXIST CHECK: '+userExists);

                if (!userExists) {
                    console.log('DOES NOT!');
                    setIsOnboarding(true);
                }
            }
        };
        checkUser();
    }, [user]);

    const handleOnboardingComplete = async () => {
        // create user profile
        await createUserProfile(user.uid, user.displayName);
        // Close the onboarding modal
        setIsOnboarding(false);
        // Redirect to the user's profile page
        window.location.href = `/profile/${user.displayName}`; 
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator
    }

    return (
        <div className={styles["dashboard-container"]}>
            <h1>Welcome to the Dashboard!</h1>
            {user ? (
                <div className={styles["user-box"]}>
                    <h2>{user.displayName}</h2>
                    {user.photoURL && 
                        <img className={styles["avatar"]} src={user.photoURL} alt={user.displayName} />
                    }
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
