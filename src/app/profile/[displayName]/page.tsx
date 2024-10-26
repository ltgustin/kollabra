"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db, auth, storage } from '@/lib/firebase';
import { Avatar, Button, Typography, Box, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Skeleton, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Chip } from '@mui/material'; 

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    brand: string;
    description: string;
    link: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfilePage = ({ params }: ProfileProps) => {
    const { user } = useAuth();
    const { displayName } = params;
    const [userProfile, setUserProfile] = useState<any>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // portfolio
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null); // State for the item being edited
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newItem, setNewItem] = useState({ 
        title: '', 
        brand: '', 
        description: '', 
        link: '', 
        imageUrl: ''
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const categoriesList = [
        { value: 'branding', label: 'Branding' },
        { value: 'graphic-design', label: 'Graphic Design' },
        { value: 'web-dev', label: 'Web Dev' },
        { value: 'contract-dev', label: 'Conract Dev' },
        { value: 'ui-ux-design', label: 'UI / UX Design' },
        { value: 'social-media', label: 'Social Media' },
        { value: 'promotions', label: 'Promotions' },
        { value: 'misc', label: 'Misc.' },
    ];
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                // Fetch user profile
                const usersRef = collection(db, 'users');
                const userQuery = query(usersRef, where('displayName', '==', displayName));
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    setUserProfile(userSnapshot.docs[0].data());
                } else {
                    router.push('/404');
                }

                // Fetch portfolio items
                const portfolioRef = collection(db, 'portfolio');
                const portfolioQuery = query(portfolioRef, where('userId', '==', displayName));
                const portfolioSnapshot = await getDocs(portfolioQuery);

                const items = portfolioSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPortfolioItems(items);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Set loading to false after both fetches
            }
        };

        fetchData();
    }, [displayName, router]);

    // CREATING
    const createPortfolioItem = async (itemData: PortfolioItem) => {
        if (user) {
            const docRef = await addDoc(collection(db, 'portfolio'), itemData);
            return docRef.id; // Return the document ID
        }
    };

    // UPDATING
    const editPortfolioItem = (itemId: string) => {
        const itemToEdit = portfolioItems.find(item => item.id === itemId);
        if (itemToEdit) {
            setNewItem({
                title: itemToEdit.title,
                brand: itemToEdit.brand,
                description: itemToEdit.description,
                link: itemToEdit.link,
                imageUrl: itemToEdit.imageUrl,
            });
            setSelectedCategories(itemToEdit.categories || []);
            setEditingItem(itemToEdit); // Set the item being edited
            setIsPopupOpen(true); // Open the dialog
        }
    };

    // DELETING
    const deletePortfolioItem = async (portfolioItemId: string) => {
        if (portfolioItemId) { // Check if id is valid
            await deleteDoc(doc(db, 'portfolio', portfolioItemId)); // Use portfolioItemId for deletion
            console.log('DELETED: ' + portfolioItemId);
            
            // Optionally, remove the item from local state
            setPortfolioItems(prevItems => prevItems.filter(item => item.id !== portfolioItemId));

            // snackbar
            setSnackbarMessage('Portfolio item deleted successfully!');
            setSnackbarOpen(true);
        } else {
            console.error('Invalid document ID:', portfolioItemId);
        }
    };

    // INPUT CHANGE FOR PORTFOLIO FORM
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prevState => ({ ...prevState, [name]: value }));
    };

    // IMAGE UPLOAD
    const uploadImages = async (images: File[]) => {
        const imageUrls = [];
        const storageRef = ref(storage);

        for (const image of images) {
            const imageRef = ref(storageRef, `portfolio/${image.name}`);
            await uploadBytes(imageRef, image);
            const url = await getDownloadURL(imageRef);
            imageUrls.push(url);
        }

        return imageUrls; // Return the array of image URLs
    };

    // SUBMIT FOR PORTFOLIO FORM
    const handleSubmit = async (e) => {
        e.preventDefault();

        const portfolioData = {
            userId: userProfile.displayName,
            title: newItem.title,
            brand: newItem.brand,
            description: newItem.description,
            link: newItem.link,
            categories: selectedCategories,
            imageUrl: newItem.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            let imageUrls = [];
            if (selectedImages.length > 0) {
                imageUrls = await uploadImages(selectedImages); // Upload images and get URLs
                portfolioData.imageUrls = imageUrls; // Add image URLs to portfolio data
            }

            if (editingItem) {
                // Update existing item
                await updateDoc(doc(db, 'portfolio', editingItem.id), portfolioData);
                setPortfolioItems(prevItems => 
                    prevItems.map(item => item.id === editingItem.id ? { ...item, ...portfolioData } : item)
                );
                setSnackbarMessage('Portfolio item updated successfully!');
            } else {
                // Create new item
                const docId = await createPortfolioItem(portfolioData);
                const newPortfolioItem: PortfolioItem = {
                    id: docId,
                    ...portfolioData,
                };
                setPortfolioItems(prevItems => [...prevItems, newPortfolioItem]);
                setSnackbarMessage('Portfolio item added successfully!');
            }

            // Show Snackbar
            setSnackbarOpen(true);

            // Reset form and close popup
            setNewItem({ title: '', brand: '', description: '', link: '', imageUrl: '' });
            setSelectedCategories([]);
            setSelectedImages([]); // Reset selected images
            setEditingItem(null); // Reset editing item
            setIsPopupOpen(false);
        } catch (error) {
            console.error('Error saving portfolio item:', error);
            setSnackbarMessage('Error saving portfolio item.');
            setSnackbarOpen(true);
        }
    }

    const canEditProfile = () => {
        return user && user.displayName === displayName;
    };
    
    // if (!userProfile) {
    //     return <div>Loading...</div>;
    // }
    
    return (
        <>
            <Container className={`${styles.profileHeader} container d-flex f-j-sb`}>
                {!userProfile ? ( // Check if userProfile exists
                    <Skeleton variant="circular">
                        <Avatar sx={{ width: 72, height: 72 }} />
                    </Skeleton>
                ) : (
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
                )}
            </Container>

            {canEditProfile() && (
                <Button onClick={() => setIsPopupOpen(true)}>Create New Portfolio</Button>
            )}

            <Container className={`${styles.profilePortfolio} container`}>
                {loading ? (
                    // Show Skeleton while loading
                    <>
                        <Skeleton variant="rectangular" height={118} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                    </>
                ) : (
                    portfolioItems.length > 0 ? (
                        portfolioItems.map(item => (
                            <Box key={item.id} className={styles.portfolioItem}>
                                <Typography variant="h5">{item.title}</Typography>
                                <Typography variant="body2">{item.description}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, marginTop: 1 }}>
                                    {item.categories && item.categories.map((category) => (
                                        <Chip key={category} label={category} />
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', marginTop: 2 }}>
                                    {item.imageUrls && item.imageUrls.map((url, index) => (
                                        <img key={index} src={url} alt={`Portfolio item ${item.title} - Image ${index + 1}`} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
                                    ))}
                                </Box>

                                {canEditProfile() && (
                                    <>
                                        {/* {item.imageUrl && <img src={item.imageUrl} alt={item.title} />} */}
                                        <Button onClick={() => editPortfolioItem(item.id)}>Edit</Button>
                                        <Button onClick={() => deletePortfolioItem(item.id)}>Delete</Button>
                                    </>
                                )}
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body1">No portfolio items found.</Typography>
                    )
                )}
            </Container>

            {canEditProfile() && (
                <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                    <DialogTitle>{editingItem ? 'Edit Portfolio Item' : 'Create Portfolio Item'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            name="title"
                            label="Project Title"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newItem.title}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="brand"
                            label="Brand / Company / NFT Project"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newItem.brand}
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
                            rows={5}
                            value={newItem.description}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            name="link"
                            label="Link (optional)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newItem.link}
                            onChange={handleInputChange}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="categories-label">Categories (choose at least one)</InputLabel>

                            <ToggleButtonGroup
                                value={selectedCategories}
                                onChange={(event, newCategories) => {
                                    if (newCategories.length) {
                                        setSelectedCategories(newCategories);
                                    }
                                }}
                                aria-label="categories"
                                color="primary"
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                }}
                            >
                                {categoriesList.map(category => (
                                    <ToggleButton
                                        key={category.value}
                                        value={category.value}
                                        sx={{
                                            borderColor: 'purple',
                                            color: selectedCategories.includes(category.value) ? 'white' : 'purple',
                                            backgroundColor: selectedCategories.includes(category.value) ? 'purple' : 'transparent',
                                            '&:hover': { backgroundColor: 'rgba(128, 0, 128, 0.1)' },
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {category.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </FormControl>
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

                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="upload-images"
                            multiple
                            type="file"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setSelectedImages(Array.from(e.target.files)); // Convert FileList to Array
                                }
                            }}
                        />
                        <label htmlFor="upload-images">
                            <Button variant="contained" component="span">
                                Upload Images
                            </Button>
                        </label>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsPopupOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} color="primary">
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProfilePage;
