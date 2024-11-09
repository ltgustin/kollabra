import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel } from '@mui/material';
import { ToggleButtonGroup, ToggleButton, Box, Typography } from '@mui/material';
import { Chip } from '@mui/material';
import styles from './Profile.module.scss';
import { useDropzone } from 'react-dropzone';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDocs, orderBy, query } from 'firebase/firestore';

interface PortfolioDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (portfolioData: any) => void; // Adjust type as needed
    itemData: {
        title: string;
        brand: string;
        description: string;
        link: string;
        categories: string[];
        selectedCategories: string[];
        setSelectedCategories: (categories: string[]) => void;
        selectedImages: { file: File, name: string }[];
        setSelectedImages: (images: { file: File, name: string }[]) => void;
    } | null;
    categoriesList: { value: string; label: string }[]; // List of categories
}

const PortfolioDialog: React.FC<PortfolioDialogProps> = ({ 
    open, 
    onClose, 
    itemData, 
    selectedCategories, 
    setSelectedCategories, 
    selectedImages, 
    setSelectedImages,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarType,
    setPortfolioItems,
    editingItem,
    setEditingItem,
    setIsPopupOpen,
    user,
    userProfile
}) => {
    
    const [newItem, setNewItem] = React.useState({
        title: itemData?.title || '',
        brand: itemData?.brand || '',
        description: itemData?.description || '',
        link: itemData?.link || '',
        categories: itemData?.categories || [],
    });

    const categoriesList = [
        { value: 'branding', label: 'Branding' },
        { value: 'graphic-design', label: 'Graphic Design' },
        { value: 'web-dev', label: 'Web Dev' },
        { value: 'contract-dev', label: 'Conract Dev' },
        { value: 'ui-ux-design', label: 'UI / UX Design' },
        { value: 'social-media', label: 'Social Media' },
        { value: 'promotions', label: 'Promotions' },
        { value: 'photography', label: 'Photography' },
        { value: 'misc', label: 'Misc.' },
    ];

    // CREATING
    const createPortfolioItem = async (itemData: PortfolioItem) => {
        if (user) {
            const docRef = await addDoc(collection(db, 'portfolio'), itemData);
            return docRef.id; // Return the document ID
        }
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
            const file = acceptedFiles[0];
            setSelectedImages([{ file, name: file.name }]);
        } else {
            alert(`You can only upload one image.`);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
        multiple: false, // Allow only one file
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCategoryChange = (event: React.MouseEvent<HTMLElement>, newCategories: string[]) => {
        setSelectedCategories(newCategories);
        setNewItem(prevState => ({ ...prevState, categories: newCategories }));
    };

    // SUBMIT FOR PORTFOLIO FORM
    const handlePortfolioSubmit = async (e) => {
        e.preventDefault();

        // Check if an image is uploaded
        if (selectedImages.length === 0) {
            setSnackbarType('error');
            setSnackbarMessage('Please upload an image before submitting.');
            setSnackbarOpen(true);
            return; // Exit the function if no image is uploaded
        }

        console.log(userProfile);

        const portfolioData = {
            userId: userProfile.slug,
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
                // Fetch the current highest order
                const portfolioRef = collection(db, 'portfolio');
                const orderQuery = query(portfolioRef, orderBy('order', 'desc'));
                const orderSnapshot = await getDocs(orderQuery);

                // Determine the next order value
                let nextOrder = 0; // Default to 0 if no items exist
                if (!orderSnapshot.empty) {
                    const highestOrderItem = orderSnapshot.docs[0].data();
                    nextOrder = highestOrderItem.order + 1;
                }

                // Add the order to the portfolio data
                portfolioData.order = nextOrder;

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

    useEffect(() => {
        if (itemData) {
            setNewItem({
                title: itemData.title,
                brand: itemData.brand,
                description: itemData.description,
                link: itemData.link,
                categories: itemData.categories,
            });
        } else {
            setNewItem({ title: '', brand: '', description: '', link: '', categories: [] });
        }
    }, [itemData, open]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg"
        >
            <DialogTitle>{itemData ? 'Edit Portfolio Item' : 'Create Portfolio Item'}</DialogTitle>
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
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={newItem.description}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="link"
                        label="Link"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newItem.link}
                        onChange={handleInputChange}
                    />
                    <FormControl fullWidth>
                        <InputLabel
                            className={styles.catLabel}
                            id="categories-label"
                            shrink="true"
                        >Categories (suggested max 3)</InputLabel>
                        <ToggleButtonGroup
                            className={styles.editCatGroup}
                            value={selectedCategories}
                            exclusive={false}
                            onChange={handleCategoryChange}
                            aria-label="categories"
                            color="primary"
                        >
                            {categoriesList.map(category => (
                                <ToggleButton
                                    className={`${styles.catToggle} ${selectedCategories.includes(category.value) ? styles.active : ''}`}
                                    key={category.value}
                                    value={category.value}
                                    aria-label={category.label}
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
                            <Typography variant="h4">
                                {selectedImages.length > 0 ? 'Replace Media' : 'Upload Media'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                One (1) image allowed <br />
                                Restricted to jpg, png, gif formats
                            </Typography>
                        </Box>

                        <Box mt={2}>
                            {selectedImages.map((url, index) => (
                                <Chip
                                    className={styles.uploadedImageChip}
                                    key={index}
                                    label={url.name}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                </div>
            </DialogContent>
            <DialogActions 
                sx={{ 
                    mb: 3, 
                    justifyContent: "center" 
                }}
            >
                <Button 
                    onClick={onClose} 
                    color="primary"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handlePortfolioSubmit} 
                    color="primary" 
                    variant="contained"
                >
                    {itemData ? 'Update Item' : 'Add Item'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PortfolioDialog;