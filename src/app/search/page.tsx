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
import { jobTypeList } from '@/constants/jobtypelist';
import { categoriesList } from '@/constants/catlist';
import { FormGroup, FormControlLabel, Checkbox, InputLabel, FormControl } from '@mui/material';

const SearchPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobItems, setJobItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [originalJobItems, setOriginalJobItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const jobsRef = collection(db, 'job');
                const jobsQuery = query(jobsRef, orderBy('createdAt'));
                const jobsSnapshot = await getDocs(jobsQuery);

                const jobItems = jobsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setJobItems(jobItems);
                setOriginalJobItems(jobItems);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const canEditProfile = () => {
        return false;
        // return user && user?.reloadUserInfo.screenName === slug;
    };

    const filterResults = () => {
        const filteredJobs = originalJobItems.filter((job) => {
            const matchesType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type);
            const matchesCategory = selectedCategories.length === 0 || job.categories.some((category) => selectedCategories.includes(category));
            return matchesType && matchesCategory;
        });

        const finalJobs = canEditProfile() ? filteredJobs : filteredJobs.filter(job => job.status === 'published');
        setJobItems(finalJobs);
    };

    return (
        <>
            <h1 className="pageTitle">Job Search</h1>
            <PageContainer>
                <Sidebar>
                    <FormControl
                        className={styles.sidebarFormControl}
                        component="fieldset"
                        fullWidth
                    >
                        <InputLabel
                            className={styles.catLabel}
                            id="job-type-label"
                            shrink={true}
                        >
                            Job Type
                        </InputLabel>
                        {jobTypeList.map((type) => (
                            <FormControlLabel
                                key={type.value}
                                control={
                                    <Checkbox
                                        checked={selectedJobTypes.includes(type.value)}
                                        onChange={() => {
                                            setSelectedJobTypes((prev) =>
                                                prev.includes(type.value)
                                                    ? prev.filter((t) => t !== type.value)
                                                    : [...prev, type.value]
                                            );
                                        }}
                                        name={type.label}
                                    />
                                }
                                label={type.label}
                            />
                        ))}
                    </FormControl>

                    <FormControl
                        className={styles.sidebarFormControl}
                        component="fieldset"
                        fullWidth
                    >
                        <InputLabel
                            className={styles.catLabel}
                            id="category-label"
                            shrink={true}
                        >
                            Category
                        </InputLabel>
                        {categoriesList.map((category) => (
                            <FormControlLabel
                                key={category.value}
                                control={
                                    <Checkbox
                                        checked={selectedCategories.includes(category.value)}
                                        onChange={() => {
                                            setSelectedCategories((prev) =>
                                                prev.includes(category.value)
                                                    ? prev.filter((c) => c !== category.value)
                                                    : [...prev, category.value]
                                            );
                                        }}
                                        name={category.label}
                                    />
                                }
                                label={category.label}
                            />
                        ))}
                    </FormControl>

                    <button onClick={filterResults}>Filter Results</button>
                </Sidebar>

                <ContentContainer>
                    {loading ? (
                        <Skeleton variant="rectangular" height={118} />
                    ) : (
                        jobItems
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