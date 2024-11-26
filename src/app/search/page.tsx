"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import styles from './Search.module.scss';
import { useRouter } from "next/navigation";
import { Skeleton } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import Sidebar from '@/components/Sidebar';
import ContentContainer from '@/components/ContentContainer';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import JobCard from '@/components/JobCard';

const SearchPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobItems, setJobItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {   
                const jobsRef = collection(db, 'job');
                const jobsQuery = query(jobsRef, orderBy('createdAt'));
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
    }, [router]);

    const canEditProfile = () => {
        return false;
        // return user && user?.reloadUserInfo.screenName === slug;
    };

    return (
        <>
            <h1 className="pageTitle">Job Search</h1>
            <PageContainer>
                <Sidebar>
                    <p>HEREERE</p>
                </Sidebar>

                <ContentContainer>
                    {loading ? (
                        <Skeleton variant="rectangular" height={118} />
                    ) : (
                        (canEditProfile() ? jobItems : jobItems.filter(job => job.status === 'published'))
                            .sort((a, b) => b.updatedAt - a.updatedAt)
                            .map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    canEditProfile={canEditProfile()}
                                    user={user}
                                    setSnackbarMessage={setSnackbarMessage}
                                    setSnackbarOpen={setSnackbarOpen}
                                    setSnackbarType={setSnackbarType}
                                />
                            ))
                    )}
                </ContentContainer>
            </PageContainer>
        </>
    );
}

export default SearchPage;