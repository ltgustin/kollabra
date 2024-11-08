'use client';

import { createContext, useContext, useState } from 'react';
import { useAuth } from './useAuth';

// Create UserProfileContext
const UserProfileContext = createContext(null);

export const useUserProfile = () => {
    return useContext(UserProfileContext);
};

export const UserProfileProvider = ({ children }) => {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<unknown>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const storedProfile = sessionStorage.getItem('userProfile');
                if (storedProfile) {
                    setUserProfile(JSON.parse(storedProfile));
                } else {
                    try {
                        const usersRef = collection(db, 'users');
                        const q = query(usersRef, where('displayName', '==', user.displayName));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            const profileData = querySnapshot.docs[0].data();
                            setUserProfile(profileData);
                            sessionStorage.setItem('userProfile', JSON.stringify(profileData));
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    return (
        <UserProfileContext.Provider value={userProfile}>
            {children}
        </UserProfileContext.Provider>
    );
};