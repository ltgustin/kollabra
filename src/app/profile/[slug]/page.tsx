"use client"; 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { Skeleton } from '@mui/material'; 
// components
import PageContainer from '@/components/PageContainer';
import Sidebar from '@/components/Sidebar';
import ContentContainer from '@/components/ContentContainer';
import ProfileHeader from './ProfileHeader';
import SnackbarNotification from '@/components/SnackbarNotification';
import CompanyJobs from './CompanyJobs';
import CreativePortfolio from './CreativePortfolio';
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

interface JobItem {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfilePage = ({ params }: ProfileProps) => {
    const { user } = useAuth();
    const { slug } = params;
    const [userProfile, setUserProfile] = useState<any>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // portfolio
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [jobItems, setJobItems] = useState<JobItem[]>([]);
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');
    
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
                const portfolioQuery = query(portfolioRef, where('userId', '==', slug), orderBy('order'));
                const portfolioSnapshot = await getDocs(portfolioQuery);

                const items = portfolioSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPortfolioItems(items);

                // Fetch job items
                const jobsRef = collection(db, 'job');
                const jobsQuery = query(jobsRef, where('userId', '==', slug), orderBy('createdAt'));
                const jobsSnapshot = await getDocs(jobsQuery);

                const jobItems = jobsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setJobItems(jobItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Set loading to false after both fetches
            }
        };

        fetchData();
    }, [slug, router]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const canEditProfile = () => {
        return user && user?.reloadUserInfo.screenName === slug;
    };

    return (
        <PageContainer>
            <Sidebar className="profile-sidebar">
                <ProfileHeader
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    canEditProfile={canEditProfile()}
                    portfolioItems={portfolioItems}
                    setPortfolioItems={setPortfolioItems}
            />
            </Sidebar>

            <ContentContainer>
                {loading ? (
                    <>
                        <Skeleton variant="rectangular" height={118} />
                    </>
                ) : userProfile.type === 'Company' ? (
                    <CompanyJobs 
                        loading={loading}
                        jobItems={jobItems}
                        setJobItems={setJobItems}
                        canEditProfile={canEditProfile()}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarOpen={setSnackbarOpen}
                        setSnackbarType={setSnackbarType}
                        userProfile={userProfile}
                        user={user}
                    />
                    ) : (
                    <CreativePortfolio
                        loading={loading}
                        portfolioItems={portfolioItems}
                        canEditProfile={canEditProfile()}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarOpen={setSnackbarOpen}
                        setSnackbarType={setSnackbarType}
                        setPortfolioItems={setPortfolioItems}
                        userProfile={userProfile}
                    />
                )}

                <SnackbarNotification
                    open={snackbarOpen}
                    message={snackbarMessage}
                    onClose={handleSnackbarClose}
                    severity={snackbarType}
                />
            </ContentContainer>
        </PageContainer>
    );
};

export default ProfilePage;
