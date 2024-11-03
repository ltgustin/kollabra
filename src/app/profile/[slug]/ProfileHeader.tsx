// profile/[slug]/ProfileHeader.tsx
import React, { useState, useEffect } from 'react';
import { Container, Avatar, Button, Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton } from '@mui/material';
import styles from './Profile.module.scss';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import InputAdornment from '@mui/material/InputAdornment';

import {
    Twitter as TwitterIcon,
    Public as PublicIcon,
} from '@mui/icons-material';

interface ProfileHeaderProps {
    userProfile: {
        displayName: string;
        profilePhoto?: string;
        type: string;
    };
    canEditProfile: boolean;
    onAddPortfolioItem: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, canEditProfile, setUserProfile, onAddPortfolioItem }) => {
    const { user } = useAuth();
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        displayName: userProfile?.displayName || '',
        twitterLink: userProfile?.twitterLink || '',
        websiteLink: userProfile?.websiteLink || '',
    });

    useEffect(() => {
        if (userProfile) {
            setEditProfileData({
                displayName: userProfile.displayName || '',
                twitterLink: userProfile.twitterLink || '',
                websiteLink: userProfile.websiteLink || '',
            });
        }
    }, [userProfile]);

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

    const handleEditProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditProfileData(prevState => ({ ...prevState, [name]: value }));
    };

    return (
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
                    <Box display="flex" alignItems="center" gap={2.25}>
                        <Avatar
                            alt={userProfile.displayName}
                            src={userProfile.profilePhoto}
                            sx={{ width: 50, height: 50 }}
                        />
                        <Box>
                            <Typography
                                variant="h2"
                                fontWeight="bold"
                                color="primary"
                            >{userProfile.displayName}</Typography>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                            >
                                <Typography
                                    variant="h5"
                                    color="textSecondary"
                                >
                                    {userProfile.type}
                                </Typography>
                                {userProfile.twitterLink && (
                                    <IconButton
                                        component="a"
                                        href={`https://x.com/${userProfile.twitterLink}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Twitter/X Link - External"
                                        size="small"
                                        color="primary"
                                    >
                                        <TwitterIcon />
                                    </IconButton>
                                )}

                                {userProfile.websiteLink && (
                                    <IconButton
                                        component="a"
                                        href={userProfile.websiteLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Profile Website Link - External"
                                        size="small"
                                        color="primary"
                                    >
                                        <PublicIcon />
                                    </IconButton>
                                )}
                            </Box>
                    </Box>

                    {canEditProfile && (
                        <Button
                            variant="contained"
                            className="tertiary small edit-profile"
                            onClick={() => setIsEditProfilePopupOpen(true)}
                        >
                            Edit Profile
                        </Button>
                    )}
                    </Box>

                    {canEditProfile && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onAddPortfolioItem}
                        >
                            Add Portfolio Item
                        </Button>
                    )}
                </Box>
            )}

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
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">https://x.com/</InputAdornment>,
                            },
                        }}
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
                <DialogActions
                    sx={{
                        mb: 3,
                        justifyContent: "center"
                    }}
                >
                    <Button
                        onClick={() => setIsEditProfilePopupOpen(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditProfileSave}
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProfileHeader;