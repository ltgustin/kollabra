// profile/[slug]/ProfileHeader.tsx
import React, { useState, useEffect } from 'react';
import { Container, Avatar, Button, Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Skeleton } from '@mui/material';
import styles from './Profile.module.scss';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import InputAdornment from '@mui/material/InputAdornment';
import { Delete as DeleteIcon } from '@mui/icons-material';

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
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, canEditProfile, setUserProfile }) => {
    const { user } = useAuth();
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isEditWorkExperiencePopupOpen, setIsEditWorkExperiencePopupOpen] = useState(false);
    const [isEditWorkSkillsPopupOpen, setIsEditWorkSkillsPopupOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        displayName: userProfile?.displayName || '',
        shortDescription: userProfile?.shortDescription || '',
        twitterLink: userProfile?.twitterLink || '',
        websiteLink: userProfile?.websiteLink || '',
    });
    const [charCount, setCharCount] = useState(editProfileData.shortDescription.length);
    const [workExperience, setWorkExperience] = useState(userProfile?.workExperience || []);
    const [workSkills, setWorkSkills] = useState(userProfile?.workSkills || []);
    useEffect(() => {
        if (userProfile) {
            const shortDescription = userProfile.shortDescription || '';
            setEditProfileData({
                displayName: userProfile.displayName || '',
                shortDescription,
                twitterLink: userProfile.twitterLink || '',
                websiteLink: userProfile.websiteLink || '',
            });
            setCharCount(shortDescription.length);
            setWorkExperience(userProfile.workExperience || []);
            setWorkSkills(userProfile.workSkills || []);

            console.log(user);
        }
    }, [userProfile]);

    const handleEditProfileSave = async () => {
        if (user) {
            const updatedProfileData = {
                ...userProfile,
                displayName: editProfileData.displayName,
                shortDescription: editProfileData.shortDescription,
                twitterLink: editProfileData.twitterLink,
                websiteLink: editProfileData.websiteLink,
            };
            // Update user profile in the database
            await updateDoc(doc(db, 'users', user.uid), updatedProfileData);
            setUserProfile(updatedProfileData); // Update local state
            sessionStorage.setItem('userProfile', JSON.stringify(updatedProfileData)); // Update session storage
            setIsEditProfilePopupOpen(false); // Close the dialog
        }
    };

    const handleEditProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'shortDescription' && value.length > 200) return;
        setEditProfileData(prevState => ({ ...prevState, [name]: value }));
        if (name === 'shortDescription') {
            setCharCount(value.length);
        }
    };

    const handleAddExperience = () => {
        setWorkExperience([...workExperience, { title: '', position: '', length: '' }]);
    };

    const handleAddSkill = () => {
        setWorkSkills([...workSkills, { title: '', description: '' }]);
    };

    const handleExperienceChange = (index: number, field: string, value: string) => {
        const updatedExperience = workExperience.map((exp, i) =>
            i === index ? { ...exp, [field]: value } : exp
        );
        setWorkExperience(updatedExperience);
    };

    const handleSkillChange = (index: number, field: string, value: string) => {
        const updatedSkills = workSkills.map((skill, i) =>
            i === index ? { ...skill, [field]: value } : skill
        );
        setWorkSkills(updatedSkills);
    };

    const handleDeleteExperience = (index: number) => {
        const updatedExperience = workExperience.filter((_, i) => i !== index);
        setWorkExperience(updatedExperience);
    };

    const handleDeleteSkill = (index: number) => {
        const updatedSkills = workSkills.filter((_, i) => i !== index);
        setWorkSkills(updatedSkills);
    };

    const handleSaveWorkExperience = async () => {
        if (user) {
            const updatedProfileData = {
                ...userProfile,
                workExperience,
            };
            // Update user profile in the database
            await updateDoc(doc(db, 'users', user.uid), updatedProfileData);
            setUserProfile(updatedProfileData); // Update local state
            setIsEditWorkExperiencePopupOpen(false); // Close the dialog
        }
    };

    const handleSaveWorkSkills = async () => {
        if (user) {
            const updatedProfileData = { 
                ...userProfile, 
                workSkills 
            };
            await updateDoc(doc(db, 'users', user.uid), updatedProfileData);
            setUserProfile(updatedProfileData); // Update local state
            setIsEditWorkSkillsPopupOpen(false); // Close the dialog
        }
    };

    return (
        <>
            {!userProfile ? ( // Check if userProfile exists
                <Skeleton variant="circular">
                    <Avatar sx={{ width: 72, height: 72 }} />
                </Skeleton>
            ) : (
               <Box
                    className={styles.profileHeader}
                    display="flex"
                    textAlign="center"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    sx={{ width: '100%' }}
                >
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
                        
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            className="mt-10 mb-10"
                        >
                            {userProfile.shortDescription}
                        </Typography>

                        <Box
                            display="flex"
                            alignItems="center"
                            className={styles.profileSocial}
                            gap={0.5}
                            justifyContent="center"
                        >
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

                        {canEditProfile && (
                            <Button
                                variant="contained"
                                className={`${styles.editProfileBtn} tertiary small`}
                                onClick={() => setIsEditProfilePopupOpen(true)}
                            >
                                Edit Profile
                            </Button>
                        )}

                        {userProfile.type === 'Creative' && (
                            <>
                            <Box 
                                marginTop={2}
                                className={styles.profileSideSection}
                            >
                                <Typography 
                                    variant="h3" 
                                    fontWeight="bold" 
                                    color="primary"
                                    mb={2}
                                >
                                    Work Experience
                                </Typography>
                                {(userProfile.workExperience || []).map((exp, index) => (
                                    <Box 
                                        key={index} 
                                        display="flex" 
                                        justifyContent="space-between" 
                                        mb={2}
                                        className={styles.workExperienceItem}
                                    >
                                        <Box>
                                            <Typography variant="body1">
                                                {exp.title}
                                            </Typography>
                                            <Typography variant="body2" fontStyle="italic">
                                                {exp.position}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {exp.length}
                                        </Typography>
                                    </Box>
                                ))}

                                {canEditProfile && (
                                    <Button 
                                        onClick={() => setIsEditWorkExperiencePopupOpen(true)} variant="contained" 
                                        color="primary"
                                        className={`${styles.editProfileBtn} tertiary small`}
                                    >
                                        Edit Work Experience
                                    </Button>
                                )}
                            </Box>

                            <Box 
                                marginTop={2}
                                className={styles.profileSideSection}
                            >
                                <Typography 
                                    variant="h3" 
                                    fontWeight="bold" 
                                    color="primary"
                                    mb={2}
                                >
                                    Skills
                                </Typography>
                                {(userProfile.workSkills || []).map((skill, index) => (
                                    <Box 
                                        key={index} 
                                        display="flex" 
                                        justifyContent="space-between" 
                                        mb={2}
                                        className={styles.workSkillItem}
                                    >
                                        <Box>
                                            <Typography variant="body1">
                                                {skill.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {skill.description}
                                        </Typography>
                                    </Box>
                                ))}

                                {canEditProfile && (
                                    <Button 
                                        onClick={() => setIsEditWorkSkillsPopupOpen(true)} variant="contained" 
                                        color="primary"
                                        className={`${styles.editProfileBtn} tertiary small`}
                                    >
                                        Edit Skills
                                    </Button>
                                )}
                            </Box>
                            </>
                        )}
                </Box>

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
                        name="shortDescription"
                        label="Short Description"
                        type="text"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={editProfileData.shortDescription}
                        onChange={handleEditProfileInputChange}
                        helperText={`${charCount}/200 characters`}
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

            <Dialog
                open={isEditWorkExperiencePopupOpen}
                onClose={() => setIsEditWorkExperiencePopupOpen(false)}
                maxWidth="sm"
            >
                <DialogTitle>Edit Work Experience</DialogTitle>
                <DialogContent>
                    {workExperience.map((exp, index) => (
                        <Box 
                            key={index} 
                            display="flex" 
                            alignItems="center" 
                            gap={2} 
                            mb={2}
                            className={styles.workExperienceEditItem}
                        >
                            <TextField
                                label="Job Title"
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                label="Job Position"
                                value={exp.position}
                                onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                label="Job Length"
                                value={exp.length}
                                onChange={(e) => handleExperienceChange(index, 'length', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            <IconButton 
                                onClick={() => handleDeleteExperience(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button onClick={handleAddExperience} variant="outlined" color="primary">
                        Add Experience
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditWorkExperiencePopupOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveWorkExperience} color="primary" variant="contained">
                        Save Work Experience
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Skills Dialog */}
            <Dialog
                open={isEditWorkSkillsPopupOpen}
                onClose={() => setIsEditWorkSkillsPopupOpen(false)}
                maxWidth="sm"
            >
                <DialogTitle>Edit Work Experience</DialogTitle>
                <DialogContent>
                    {workSkills.map((skill, index) => (
                        <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={2}
                            className={styles.workExperienceEditItem}
                        >
                            <TextField
                                label="Skill Title"
                                value={skill.title}
                                onChange={(e) => handleSkillChange(index, 'title', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                label="Skill Length"
                                value={skill.description}
                                onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                            <IconButton
                                onClick={() => handleDeleteSkill(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button onClick={handleAddSkill} variant="outlined" color="primary">
                        Add Skill
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditWorkSkillsPopupOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveWorkSkills} color="primary" variant="contained">
                        Save Skills
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileHeader;