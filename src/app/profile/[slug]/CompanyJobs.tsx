import React, { useState } from 'react';
import { Box, Container, Typography, Button, Skeleton } from '@mui/material';
import styles from './Profile.module.scss';
import JobCard from '@/components/JobCard';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CompanyJobs = ({
    loading,
    jobItems,
    setJobItems,
    canEditProfile,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarType,
    userProfile,
    user
}: {
    loading: boolean;
    jobItems: JobItem[];
    setJobItems: (items: JobItem[]) => void;
    canEditProfile: () => boolean;
    userProfile: UserProfile;
    user: User;
}) => {
    const router = useRouter();

    // NEW JOB
    const handleCreateNewJob = async () => {
        try {
            const docRef = await addDoc(collection(db, 'job'), {
                status: 'draft',
                userId: userProfile.slug,
                displayName: userProfile.displayName,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Redirect to the new job's editing page
            router.push(`/job/${docRef.id}`);
        } catch (error) {
            console.error('Error creating job:', error);
            setSnackbarMessage('An error occurred.');
            setSnackbarOpen(true);
            setSnackbarType('error');
        }
    };

    return (
        <>
            {!loading && canEditProfile && jobItems.length > 0 && (
                <Button
                    className={styles.addNewBtn}
                    variant="contained"
                    color="primary"
                    onClick={handleCreateNewJob}
                >
                    Add Job
                </Button>
            )}
        
            <Container className={`${styles.companyJobs} container`}>
                {loading ? (
                    <Skeleton variant="rectangular" height={118} />
                ) : (
                    jobItems.filter(job => job.status === 'published').length > 0 ? (
                        jobItems.filter(job => job.status === 'published').map((job) => (
                            <JobCard 
                                key={job.id} 
                                job={job} 
                                canEditProfile={canEditProfile}
                                user={user}
                                setSnackbarMessage={setSnackbarMessage}
                                setSnackbarOpen={setSnackbarOpen}
                                setSnackbarType={setSnackbarType}
                            />
                        ))
                    ) : (
                        canEditProfile && (
                            <Box 
                                display="flex"
                            alignItems="center"
                            justifyContent="center"
                            className={styles.noJobsContainer}
                        >
                            <Box
                                maxWidth="700px"
                            >
                                <Typography 
                                    variant="h4" 
                                    align="center"
                                    mb={2}
                                >
                                        Add your first job listing
                                </Typography>
                                <Typography mb={2} variant="body1" align="center">
                                    Let's get you started with your first job listing and start hiring top talent.
                                </Typography>
                                <Button
                                    className={styles.addFirstBtn}
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCreateNewJob}
                                        >
                                    Post your first job
                                </Button>
                            </Box>
                            </Box>
                        )
                    )
                )}
            </Container>
        </>
    );
};

export default CompanyJobs;