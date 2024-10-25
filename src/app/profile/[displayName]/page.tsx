"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db, auth } from '@/lib/firebase';
import { Avatar, Button, Typography, Box, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'; 

import styles from './Profile.module.scss';

interface ProfileProps {
    params: {
        displayName: string;
    };
}

interface PortfolioItem {
    id: string;
    userId: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfilePage = ({ params }: ProfileProps) => {
    const { user } = useAuth();
    const { displayName } = params;
    const [userProfile, setUserProfile] = useState<any>(null);
    const router = useRouter();

    // portfolio
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', description: '', imageUrl: '' });
    
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

    useEffect(() => {
        const fetchPortfolioItems = async () => {
            const portfolioRef = collection(db, 'portfolio');
            const q = query(portfolioRef, where('userId', '==', displayName)); // Assuming displayName is used as userId
            const querySnapshot = await getDocs(q);
            
            // Ensure that the id is correctly populated
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id, // This should correctly get the document ID
                ...doc.data()
            })) as PortfolioItem[];

            setPortfolioItems(items);
        };
        fetchPortfolioItems();
    }, [displayName]);

    // CREATING
    const createPortfolioItem = async (itemData: PortfolioItem) => {
        if (user) {
            const docRef = await addDoc(collection(db, 'portfolio'), itemData);
            return docRef.id; // Return the document ID
        }
    };

    // DELETING
    const deletePortfolioItem = async (portfolioItemId: string) => {
        if (portfolioItemId) { // Check if id is valid
            await deleteDoc(doc(db, 'portfolio', portfolioItemId)); // Use portfolioItemId for deletion
            console.log('DELETED: ' + portfolioItemId);
            
            // Optionally, remove the item from local state
            setPortfolioItems(prevItems => prevItems.filter(item => item.id !== portfolioItemId));
        } else {
            console.error('Invalid document ID:', portfolioItemId);
        }
    };

    // INPUT CHANGE FOR PORTFOLIO FORM
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prevState => ({ ...prevState, [name]: value }));
    };

    // SUBMIT FOR PORTFOLIO FORM
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create the portfolio item in Firestore and get the generated ID
        const docId = await createPortfolioItem({
            userId: userProfile.displayName,
            title: newItem.title,
            description: newItem.description,
            imageUrl: newItem.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create the newPortfolioItem with the generated ID
        const newPortfolioItem: PortfolioItem = {
            id: docId, // Set the generated ID
            userId: userProfile.displayName,
            title: newItem.title,
            description: newItem.description,
            imageUrl: newItem.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Update the local state with the new item
        setPortfolioItems(prevItems => [
            ...prevItems,
            newPortfolioItem // Add the new item with the generated ID
        ]);

        // Also, update the Firestore document to include the ID
        await updateDoc(doc(db, 'portfolio', docId), { id: docId });

        // Reset form and close popup
        setNewItem({ title: '', description: '', imageUrl: '' });
        setIsPopupOpen(false);
    };
    
    if (!userProfile) {
        return <div>Loading...</div>;
    }
    

    const canEditProfile = () => {
        return user && user.displayName === displayName;
    };

    return (
        <>
            <Container className={`${styles.profileHeader} container d-flex f-j-sb`}>            
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                        alt={userProfile.displayName}
                        src={userProfile?.profilePhoto}
                        sx={{ width: 72, height: 72 }}
                    />

                    <Box>
                        <Typography variant="h3" fontWeight="bold" color="primary">{userProfile.displayName}</Typography>
                        <Typography variant="body1" color="textSecondary">{userProfile.type}</Typography>
                    </Box>

                    {canEditProfile() && (
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ bgcolor: 'rgba(243, 189, 239, 0.5)', textTransform: 'none' }}
                            onClick={() => { }}
                        >
                            Edit Profile
                        </Button>
                    )}
                </Box>
            </Container>

            {canEditProfile() && (
                <Button onClick={() => setIsPopupOpen(true)}>Create New Portfolio</Button>
            )}

            <Container className={`${styles.profilePortfolio} container`}>
                {portfolioItems.length > 0 ? (
                    portfolioItems.map(item => (
                        <Box key={item.id} className={styles.portfolioItem}>
                            <Typography variant="h5">{item.title}</Typography>
                            <Typography variant="body2">{item.description}</Typography>

                            {canEditProfile() && (
                                <>
                                    {/* {item.imageUrl && <img src={item.imageUrl} alt={item.title} />} */}
                                    {/* <Button onClick={() => editPortfolioItem(item.id)}>Edit</Button> */}
                                    <Button onClick={() => deletePortfolioItem(item.id)}>Delete</Button>
                                </>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1">No portfolio items found.</Typography>
                )}
            </Container>

            {canEditProfile() && (
                <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                    <DialogTitle>Create Portfolio Item</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="title"
                            label="Title"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newItem.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={4}
                            value={newItem.description}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="imageUrl"
                            label="Image URL"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newItem.imageUrl}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsPopupOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} color="primary">
                            Add Item
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default ProfilePage;
