import React, { useState, useEffect } from 'react';
import { SortableContext } from '@dnd-kit/sortable';
import { ImageList, ImageListItem, Box, Typography, Chip, Dialog, DialogTitle, Button, DialogActions } from '@mui/material';
import { deleteDoc, doc } from 'firebase/firestore';
import SortableItem from './SortableItem';
import styles from './Profile.module.scss';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

import PortfolioDialog from './PortfolioDialog';

interface PortfolioListProps {
    items: {
        id: string;
        title: string;
        brand: string;
        description: string;
        imageUrls: string[];
        categories: string[];
    }[];
    canEditProfile: () => boolean;
}

const PortfolioList: React.FC<PortfolioListProps> = ({ 
    items, 
    canEditProfile, 
    portfolioItems, 
    setSnackbarMessage, 
    setSnackbarOpen,
    setSnackbarType,
    setPortfolioItems,
    userProfile,
    selectedCategories,
    setSelectedCategories,
    isPopupOpen,
    setIsPopupOpen,
    editingItem,
    setEditingItem
}) => {
    const { user } = useAuth();
    const [newItem, setNewItem] = useState({
        title: '',
        brand: '',
        description: '',
        link: '',
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

    const handleDeleteConfirm = async () => {
        if (itemToDelete) {
            await deletePortfolioItem(itemToDelete);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
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

    const handleDialogClose = () => {
        // Reset form fields when closing the dialog
        setNewItem({ title: '', brand: '', description: '', link: '' });
        setSelectedCategories([]);
        setSelectedImages([]);
        setEditingItem(null);
        setIsPopupOpen(false);
    };

    // Function to extract and format the file name
    const getPrettyFileName = (url: string): string => {
        if (!url) return 'Unknown File'; // Handle undefined or empty URL

        const parts = url.split('/'); // Split the URL by '/'
        const fileNameWithExtension = parts[parts.length - 1]; // Get the last part of the URL
        const fileName = fileNameWithExtension.split('.')[0]; // Remove the extension
        const cleanFileName = decodeURIComponent(fileName); // Decode any URL-encoded characters

        return cleanFileName.replace(/^portfolio\//, '');
    };

    // Confirm delete
    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    return (
        <>
        <SortableContext items={items.map(item => item.id)}>
            <ImageList className={styles.portfolioGrid} variant="masonry" cols={3} gap={8}>
                {items.map(item => (
                    canEditProfile ? (
                        <SortableItem
                            key={item.id}
                            item={item}
                            editPortfolioItem={editPortfolioItem}
                            onDelete={confirmDelete}
                            canEditProfile={canEditProfile}
                        />
                    ) : (
                        <ImageListItem key={item.id} className={styles.portfolioItem}>
                            {/* Render non-draggable item */}
                            <Box>
                                <img
                                    srcSet={`${item.imageUrls[0]}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                    src={`${item.imageUrls[0]}?w=248&fit=crop&auto=format`}
                                    alt={item.title}
                                    loading="lazy"
                                />
                                <Box className={styles.portfolioItemInfo}>
                                    <Typography
                                        variant="h4"
                                        className={styles.portfolioItemTitle}
                                    >{item.title}
                                        {item.brand && (
                                            ` | ${item.brand}`
                                        )}
                                    </Typography>
                                    <Typography variant="body1">{item.description}</Typography>

                                    <Box className={styles.portfolioItemCats}>
                                        {item.categories && item.categories.map((category) => (
                                            <Chip
                                                key={category}
                                                label={category}
                                                className={styles.portfolioItemCat}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </ImageListItem>
                    )
                ))}
            </ImageList>
        </SortableContext>
        
        <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
        >
            <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
            <DialogActions
                sx={{ mb: 3, justifyContent: "center" }}
            >
                <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button
                    onClick={handleDeleteConfirm}
                    color="primary"
                    variant="contained"
                >Delete</Button>
            </DialogActions>
        </Dialog>

        {typeof canEditProfile === 'boolean' && canEditProfile && (
            <PortfolioDialog
                open={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                itemData={editingItem}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                setSnackbarMessage={setSnackbarMessage}
                setSnackbarOpen={setSnackbarOpen}
                setSnackbarType={setSnackbarType}
                setPortfolioItems={setPortfolioItems}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                setIsPopupOpen={setIsPopupOpen}
                user={user}
                userProfile={userProfile}
            />
        )}
        </>
    );
};

export default PortfolioList;