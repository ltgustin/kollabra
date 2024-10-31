import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function updatePortfolioItemOrder(id, order) {
    const portfolioItemRef = doc(db, 'portfolio', id);
    await updateDoc(portfolioItemRef, { order });
}