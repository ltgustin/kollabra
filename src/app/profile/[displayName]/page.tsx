"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
// import { useAuth } from '@/hooks/useAuth';
import { db, auth } from '@/lib/firebase';

interface ProfileProps {
    params: {
        displayName: string;
    };
}

const ProfilePage = ({ params }: ProfileProps) => {
    // const { user } = useAuth(); // redirects

    const { displayName } = params;
    const [userProfile, setUserProfile] = useState<any>(null);
    const router = useRouter();
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('displayName', '==', displayName));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setUserProfile(querySnapshot.docs[0].data());
                } else {
                    router.push('/404');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserProfile();
    }, [displayName, router]);

    if (!userProfile) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{userProfile.displayName}'s Profile</h1>
            <p>ID: {userProfile.id}</p>
            <p>Onboarded: {userProfile.onboarded ? 'Yes' : 'No'}</p>
            <p>Created At: {userProfile.createdAt.toString()}</p>
        </div>
    );
};

export default ProfilePage;
