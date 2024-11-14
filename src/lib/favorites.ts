import { db } from './firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export async function addToFavorites(userId: string, jobId: string) {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, {
            favorites: arrayUnion(jobId)
        });
        console.log(`Job ${jobId} added to favorites for user ${userId}`);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

export async function removeFromFavorites(userId: string, jobId: string) {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, {
            favorites: arrayRemove(jobId)
        });
        console.log(`Job ${jobId} removed from favorites for user ${userId}`);
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
}