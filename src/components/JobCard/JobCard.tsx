// PortfolioItem.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import styles from './JobCard.module.scss';
import { addToFavorites, removeFromFavorites } from '@/lib/favorites'; 
import { useUserProfile } from '@/hooks/UserProfileContext';

export default function JobCard({ 
    job, 
    canEditProfile, 
    user,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarType,
}) {
    const [isFavorited, setIsFavorited] = useState(false);
    const userProfile = useUserProfile();

    useEffect(() => {
        if (userProfile && userProfile.type === "Creative") {
            setIsFavorited(userProfile.favorites.includes(job.id));
        }
    }, [userProfile, job.id]);

    console.log(canEditProfile);

    const toggleFavorite = async () => {
        if (!userProfile) return;

        try {
            let updatedFavorites;
            if (isFavorited) {
                await removeFromFavorites(userProfile.id, job.id);
                updatedFavorites = userProfile.favorites.filter(fav => fav !== job.id);
                setSnackbarMessage('Job removed from favorites');
            } else {
                await addToFavorites(userProfile.id, job.id);
                updatedFavorites = [...userProfile.favorites, job.id];
                setSnackbarMessage('Job added to favorites');
            }

            // Update local state
            setIsFavorited(!isFavorited);

            // Update session storage
            const updatedProfile = { ...userProfile, favorites: updatedFavorites };
            sessionStorage.setItem('userProfile', JSON.stringify(updatedProfile));

            // Optionally update the context state if needed
            // setUserProfile(updatedProfile);

            setSnackbarOpen(true);
            setSnackbarType('success');
        } catch (error) {
            setSnackbarMessage('Error updating favorites');
            setSnackbarOpen(true);
            setSnackbarType('error');
        }
    };
    
    return (
        <Box className={styles.jobCard}>
            <Box 
                className={styles.top}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box 
                    className={styles.topLeft}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                >
                    <Typography variant="body1">{job.displayName}</Typography>
                    <Typography variant="h4">{job.title}</Typography>
                </Box>
                <Box 
                    className={styles.topRight}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    gap={1}
                >
                    {
                    canEditProfile ? (
                        <Typography 
                            className={`${styles.jobStatus} ${job.status === 'draft' ? styles.draftStatus : styles.publishedStatus}`}
                        variant="body2"
                        >Status: <span>{job.status}</span></Typography>
                    ) : (
                        <Button onClick={toggleFavorite}>
                            {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Button>
                    )}
                        <Typography variant="body2">
                            Updated: {new Date(job.updatedAt.seconds * 1000).toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>
            <Box 
                className={styles.bottom}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
            >
                {job.salary && <Typography variant="body1">{job.salary}</Typography>}

                <Button 
                    variant="contained" 
                    color="primary" 
                    href={`/job/${job.id}`}
                >
                    {canEditProfile ? 'Edit Job' : 'Job Details'}
                </Button>
            </Box>
        </Box>
    );
};