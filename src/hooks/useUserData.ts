import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUserData(userId: string) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                const userDoc = doc(db, 'users', userId);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
        };

        fetchUser();
    }, [userId]);

    return userData;
};