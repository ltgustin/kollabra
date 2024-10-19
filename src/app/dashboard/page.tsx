"use client"; 

import { useAuth } from '../../hooks/useAuth';
import styles from './Dashboard.module.scss';

export default function DashboardPage() {
    // const userData = useUserData(userId); // Call the hook with the userId

    const { user, loading } = useAuth();

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
        </div>
    );
}
