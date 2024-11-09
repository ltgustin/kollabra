import React, { useState } from 'react';
import { Skeleton, Container, Typography, Button } from '@mui/material';
import styles from './Profile.module.scss';
import { DndContext } from '@dnd-kit/core';
import PortfolioList from './PortfolioList';
import { arrayMove } from '@dnd-kit/sortable';

const CreativePortfolio = ({ 
    loading, 
    portfolioItems, 
    canEditProfile,
    setSnackbarMessage, 
    setSnackbarOpen, 
    setPortfolioItems,
    userProfile,
    setSnackbarType
}) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    // Function to save the new order to the backend
    const savePortfolioOrder = async (items) => {
        try {
            const response = await fetch('/api/savePortfolioOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(items.map((item, index) => ({ id: item.id, order: index }))), // Use index as order
            });

            // Log the response for debugging
            const responseData = await response.json();
            console.log('Response from API:', responseData);

            if (!response.ok) {
                throw new Error(`Failed to save order: ${responseData.error || 'Unknown error'}`);
            }

            return responseData;
        } catch (error) {
            console.error('Error in savePortfolioOrder:', error);
            throw error; // Rethrow the error after logging
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        // Check if active and over are defined
        if (!active || !over) {
            console.warn("Drag ended without a valid active or over item.");
            return; 
        }

        if (active.id !== over.id) {
            const oldIndex = portfolioItems.findIndex(item => item.id === active.id);
            const newIndex = portfolioItems.findIndex(item => item.id === over.id);

            // Ensure both indices are valid
            if (oldIndex === -1 || newIndex === -1) {
                console.log("Invalid indices for active or over item.");
                return;
            }

            // Update the state with the new order
            const newPortfolioItems = arrayMove(portfolioItems, oldIndex, newIndex);
            setPortfolioItems(newPortfolioItems);

            // Send the new order to the backend
            try {
                await savePortfolioOrder(newPortfolioItems);
            } catch (error) {
                console.log("Failed to save the new order:", error);
            }
        }
    };

    // NEW ITEM
    const handleCreateNewItem = () => {
        setEditingItem(null);
        setSelectedCategories([]);
        setIsPopupOpen(true);
    };

    return (
        <>
            {canEditProfile && (
                <Button
                    className={styles.addNewBtn}
                    variant="contained"
                    color="primary"
                    onClick={handleCreateNewItem}
                >
                    Add Portfolio Item
                </Button>
            )}
            <DndContext onDragEnd={handleDragEnd}>
                <Container className={`${styles.profilePortfolio}`}>
                    {loading ? (
                        // Show Skeleton while loading
                        <>
                            <Skeleton variant="rectangular" height={118} />
                            <Skeleton variant="text" />
                            <Skeleton variant="text" />
                        </>
                    ) : (
                        portfolioItems.length > 0 ? (
                            <PortfolioList
                                items={portfolioItems}
                                canEditProfile={canEditProfile}
                                portfolioItems={portfolioItems}
                                setSnackbarMessage={setSnackbarMessage}
                                setSnackbarOpen={setSnackbarOpen}
                                setSnackbarType={setSnackbarType}
                                setPortfolioItems={setPortfolioItems}
                                userProfile={userProfile}
                                selectedCategories={selectedCategories}
                                setSelectedCategories={setSelectedCategories}
                                isPopupOpen={isPopupOpen}
                                setIsPopupOpen={setIsPopupOpen}
                                editingItem={editingItem}
                                setEditingItem={setEditingItem}
                            />
                        ) : (
                            <Typography variant="body1">No portfolio items found.</Typography>
                        )
                    )}
                </Container>
                
            </DndContext>
        </>
    );
};

export default CreativePortfolio;