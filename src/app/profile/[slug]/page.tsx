"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db, auth, storage } from '@/lib/firebase';
import { useDropzone } from 'react-dropzone';
import { Avatar, Button, Typography, Box, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Skeleton, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Chip, ImageListItem, ImageList, IconButton, Tooltip } from '@mui/material'; 

import { useUserProfile } from '@/hooks/UserProfileContext';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import styles from './Profile.module.scss';

interface ProfileProps {
    params: {
        slug: string;
    };
}

interface PortfolioItem {
    id: string;
    userId: string;
    title: string;
    brand: string;
    description: string;
    link: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfilePage = ({ params }: ProfileProps) => {
    const { user } = useAuth();
    const { slug } = params;
    const displayName = useUserProfile?.displayName;
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
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false); // State for Edit Profile dialog
    const [editProfileData, setEditProfileData] = useState({ // State for Edit Profile form data
        displayName: userProfile?.displayName || '',
        twitterLink: userProfile?.twitterLink || '',
        websiteLink: userProfile?.websiteLink || '',
    });

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
                const userQuery = query(usersRef, where('slug', '==', slug));
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    setUserProfile(userSnapshot.docs[0].data());
                } else {
                    router.push('/404');
                }

                // Fetch portfolio items
                const portfolioRef = collection(db, 'portfolio');
                const portfolioQuery = query(portfolioRef, where('userId', '==', slug));
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
    }, [slug, router]);

    const handleCreateNewItem = () => {
        setEditingItem(null); // Clear fields
        setIsPopupOpen(true); // Open the dialog
    };

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
            });
            setSelectedCategories(itemToEdit.categories || []);
            // Ensure selectedImages includes both the file and name
            setSelectedImages(itemToEdit.imageUrls.map(url => ({ file: null, name: getPrettyFileName(url) })) || []); // Adjusted to include name
            setEditingItem(itemToEdit); // Set the item being edited
            setIsPopupOpen(true); // Open the dialog
        }
    };

    // DELETING
    const deletePortfolioItem = async (portfolioItemId: string) => {
        if (portfolioItemId) { // Check if id is valid
            await deleteDoc(doc(db, 'portfolio', portfolioItemId));
            
            setPortfolioItems(prevItems => prevItems.filter(item => item.id !== portfolioItemId));

            // snackbar
            setSnackbarMessage('Portfolio item deleted successfully!');
            setSnackbarOpen(true);
        } else {
            console.error('Invalid document ID:', portfolioItemId);
        }
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (itemToDelete) {
            await deletePortfolioItem(itemToDelete);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    // INPUT CHANGE FOR PORTFOLIO FORM
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prevState => ({ ...prevState, [name]: value }));
    };

    // IMAGE UPLOAD
    const uploadImages = async (image: { file: File; name: string }) => {
        const imageUrls = [];
        const storageRef = ref(storage);
        const imageRef = ref(storageRef, `portfolio/${image.file.name}`);

        // Check if the image is valid before uploading
        if (image.file && image.file.size > 0) {
            await uploadBytes(imageRef, image.file); // Use the file object directly
            const url = await getDownloadURL(imageRef);
            imageUrls.push(url);
        } else {
            console.error('Invalid image file:', image.file);
        }

        return imageUrls; // Return the array of image URLs
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]; // Only take the first file
            setSelectedImages([{ file, name: file.name }]); // Store the single file
        } else {
            alert(`You can only upload one image.`);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
        multiple: false, // Allow only one file
    });

    const handleImageDelete = (fileToDelete: File) => {
        setSelectedImages((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));
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
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            let imageUrls = [];
            if (selectedImages.length > 0) {
                const validImage = selectedImages[0]; // Get the single image
                if (validImage.file) {
                    imageUrls = await uploadImages(validImage); // Upload the image and get URL
                    portfolioData.imageUrls = imageUrls; // Add image URLs to portfolio data
                }
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
            setNewItem({ title: '', brand: '', description: '', link: '' });
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
        return user && user?.reloadUserInfo.screenName === slug;
    };
    
    // if (!userProfile) {
        //     return <div>Loading...</div>;
        // }
    
    const handleDialogClose = () => {
        // Reset form fields when closing the dialog
        setNewItem({ title: '', brand: '', description: '', link: '' });
        setSelectedCategories([]);
        setSelectedImages([]);
        setEditingItem(null);
        setIsPopupOpen(false);
    };

    useEffect(() => {
        if (isPopupOpen) {
            if (editingItem) {
                // Prefill fields with the editing item data
                setNewItem({
                    title: editingItem.title,
                    brand: editingItem.brand,
                    description: editingItem.description,
                    link: editingItem.link,
                });
                setSelectedCategories(editingItem.categories || []);
            } else {
                // Reset form fields when creating a new item
                setNewItem({ title: '', brand: '', description: '', link: '' });
                setSelectedCategories([]);
                setSelectedImages([]);
            }
        }
    }, [isPopupOpen, editingItem]);

    // Function to extract and format the file name
    const getPrettyFileName = (url: string): string => {
        if (!url) return 'Unknown File'; // Handle undefined or empty URL

        const parts = url.split('/'); // Split the URL by '/'
        const fileNameWithExtension = parts[parts.length - 1]; // Get the last part of the URL
        const fileName = fileNameWithExtension.split('.')[0]; // Remove the extension
        const cleanFileName = decodeURIComponent(fileName); // Decode any URL-encoded characters
        
        return cleanFileName.replace(/^portfolio\//, '');
    };

    // Function to handle input changes for Edit Profile form
    const handleEditProfileInputChange = (e) => {
        const { name, value } = e.target;
        setEditProfileData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleEditProfileSave = async () => {
        if (user) {
            const updatedProfileData = {
                ...userProfile,
                displayName: editProfileData.displayName,
                twitterLink: editProfileData.twitterLink,
                websiteLink: editProfileData.websiteLink,
            };
            // Update user profile in the database
            await updateDoc(doc(db, 'users', user.uid), updatedProfileData);
            setUserProfile(updatedProfileData); // Update local state
            setIsEditProfilePopupOpen(false); // Close the dialog
        }
    };

    useEffect(() => {
        if (userProfile) {
            setEditProfileData({
                displayName: userProfile.displayName || '',
                twitterLink: userProfile.twitterLink || '',
                websiteLink: userProfile.websiteLink || '',
            });
        }
    }, [userProfile]); // Update editProfileData whenever userProfile changes

    return (
        <>
            <Container className={`${styles.profileHeader} container d-flex f-j-sb`}>
                {!userProfile ? ( // Check if userProfile exists
                    <Skeleton variant="circular">
                        <Avatar sx={{ width: 72, height: 72 }} />
                    </Skeleton>
                ) : (
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        gap={2}
                        sx={{ width: '100%' }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                                alt={userProfile.displayName}
                                src={userProfile?.profilePhoto}
                                sx={{ width: 72, height: 72 }}
                            />
                            <Box>
                                <Typography variant="h2" fontWeight="bold" color="primary">{userProfile.displayName}</Typography>
                                <Typography variant="h5" color="textSecondary">{userProfile.type}</Typography>
                            </Box>
                            {canEditProfile() && (
                                <Button
                                    variant="contained"
                                    className="tertiary small edit-profile"
                                    onClick={() => {
                                        setIsEditProfilePopupOpen(true);
                                        setEditProfileData({
                                            displayName: userProfile?.displayName || '',
                                            twitterLink: userProfile?.twitterLink || '',
                                            websiteLink: userProfile?.websiteLink || '',
                                        });
                                    }}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </Box>

                        {canEditProfile() && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateNewItem}
                            >Add Portfolio Item</Button>
                        )}
                    </Box>
                )}
            </Container>

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
                        <ImageList className={styles.portfolioGrid} variant="masonry" cols={3} gap={8}>
                            {portfolioItems.map(item => (
                                <ImageListItem className={styles.portfolioItem} key={item.id}>
                                    <Box> {/* Added Box to wrap the contents */}
                                        <img
                                            srcSet={`${item.imageUrls[0]}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                            src={`${item.imageUrls[0]}?w=248&fit=crop&auto=format`}
                                            alt={item.title}
                                            loading="lazy"
                                        />
                                        <Box className={styles.portfolioItemInfo}>
                                            <h2>{item.title}</h2>
                                            <p>{item.description}</p>
                                            <div className="cats">
                                                {item.categories && item.categories.map((category) => (
                                                    <Chip key={category} label={category} />
                                                ))}
                                            </div>
                                        </Box>

                                        {canEditProfile() && (
                                            <Box className={styles.actionButtons}>
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => editPortfolioItem(item.id)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => confirmDelete(item.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box> {/* Closing Box here */}
                                </ImageListItem>
                            ))}
                        </ImageList>
                    ) : (
                        <Typography variant="body1">No portfolio items found.</Typography>
                    )
                )}
            </Container>

            {canEditProfile() && (
                <Dialog 
                    className={styles.portfolioEditDialog} 
                    open={isPopupOpen} 
                    onClose={handleDialogClose}
                    maxWidth="lg"
                >
                    <DialogTitle>{editingItem ? 'Edit Portfolio Item' : 'Create Portfolio Item'}</DialogTitle>
                    <DialogContent className={styles.dialogFlex}>
                        <div className={styles.dialogColumn}>
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
                        </div>
                        
                        <div className={styles.dialogColumn}>
                            <Box className={styles.uploadField}>
                                <Box className={styles.upload} {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Typography variant="h6">Upload Media</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Max five (5) images <br />
                                        Restricted to jpg, png, gif formats
                                    </Typography>
                                </Box>

                                <Box mt={2}>
                                    {selectedImages.map((url, index) => (
                                        <Chip
                                            key={index}
                                            label={url.name}
                                            onDelete={() => handleImageDelete(url)}
                                            sx={{ marginRight: 1, marginBottom: 1 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </div>

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

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isEditProfilePopupOpen}
                onClose={() => setIsEditProfilePopupOpen(false)}
                maxWidth="sm"
            >
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="displayName"
                        label="Display Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editProfileData.displayName}
                        onChange={handleEditProfileInputChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="twitterLink"
                        label="Twitter Link"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editProfileData.twitterLink}
                        onChange={handleEditProfileInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="websiteLink"
                        label="Website Link"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editProfileData.websiteLink}
                        onChange={handleEditProfileInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditProfilePopupOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditProfileSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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
