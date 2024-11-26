"use client";

import { useState, useEffect, useMemo} from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import styles from './EditJob.module.scss';
import NextLink from 'next/link';
import { Box, Button, FormControl, InputLabel, TextField, Radio, RadioGroup, FormControlLabel, FormGroup, Checkbox, Typography } from '@mui/material';

import { categoriesList } from '@/constants/catlist';

import PageContainer from '@/components/PageContainer';
import Sidebar from '@/components/Sidebar';
import ContentContainer from '@/components/ContentContainer';

import SnackbarNotification from '@/components/SnackbarNotification';

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
    MenuSelectHeading,
    MenuButtonBold,
    MenuButtonItalic,
    MenuButtonUnderline,
    MenuButtonBulletedList,
    MenuButtonOrderedList,
    MenuButtonBlockquote,
    MenuDivider,
    MenuButtonRedo,
    MenuButtonEditLink,
    MenuButtonUndo,
    MenuButtonSubscript,
    MenuButtonSuperscript,
    MenuButtonHorizontalRule,
    MenuControlsContainer,
    RichTextEditorProvider,
    RichTextField,
    LinkBubbleMenu,
    LinkBubbleMenuHandler,
} from "mui-tiptap";

interface JobProps {
    params: {
        id: string;
    };
}

const EditJob = ({ params }: JobProps) => {
    const { user } = useAuth();
    const router = useRouter();
    const { id } = params;
    const [job, setJob] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');    

    const editor = useEditor({
        extensions: [
            StarterKit, 
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: false,
                defaultProtocol: 'https',
            }),
            LinkBubbleMenuHandler,
            Subscript,
            Superscript,
        ],
        content: '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setJob((prevJob) => ({ ...prevJob, description: editor.getHTML() }));
        },
    });

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const fetchJob = async () => {
            const docRef = doc(db, 'job', id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const jobData = docSnap.data();
                setJob(jobData);
                setSelectedJobType(jobData.type || null);
                setSelectedJobCategories(jobData.categories || []);
                editor?.commands.setContent(jobData.description || '');
            } else {
                setSnackbarMessage('Job not found');
                setSnackbarType('error');
                setSnackbarOpen(true);
            }
        };

        fetchJob();
    }, [router, id, editor]);

    const canEditProfile = () => {
        return user && user?.reloadUserInfo.screenName === job.userId;
    };

    const handleSave = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            status: 'draft',
            updatedAt: new Date(),
        });
        setJob(prevJob => ({ ...prevJob, status: 'draft' }));
        setSnackbarMessage('Job saved successfully');
        setSnackbarType('success');
        setSnackbarOpen(true);
    };

    const handleSaveAndPublish = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            status: 'published',
            updatedAt: new Date(),
        });
        setJob(prevJob => ({ ...prevJob, status: 'published' }));
        setSnackbarMessage('Job published successfully');
        setSnackbarType('success');
        setSnackbarOpen(true);
    };

    const jobTypesList = [
        { value: 'full-time', label: 'Full-Time' },
        { value: 'part-time', label: 'Part-Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'internship', label: 'Internship' },
    ];

    // Add state to manage selected type
    const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
    const [selectedJobCategories, setSelectedJobCategories] = useState<string[]>([]);

    const handleJobTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newType = (event.target as HTMLInputElement).value;
        setSelectedJobType(newType);
        setJob(prevJob => ({ ...prevJob, type: newType }));
    };

    const handleJobCategoriesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const category = event.target.value;
        setSelectedJobCategories(prevCategories => {
            const updatedCategories = prevCategories.includes(category)
                ? prevCategories.filter(c => c !== category)
                : [...prevCategories, category];

            console.log(updatedCategories);

            setJob(prevJob => ({
                ...prevJob,
                categories: updatedCategories
            }));

            return updatedCategories;
        });
    };

    const getLabels = (
        values: string[],
        mappingList: { value: string; label: string }[],
        returnStyle: 'comma' | 'paragraph' = 'comma'
    ) => {
        const labels = values.map(value => {
            const item = mappingList.find(mapping => mapping.value === value);
            return item ? item.label : value;
        });

        if (returnStyle === 'paragraph') {
            return labels.map(label => `<p>${label}</p>`).join('');
        }

        return labels.join(', ');
    };

    if (!job) return <div>Loading...</div>;

    return (
        <PageContainer>
            <Sidebar>
                {canEditProfile() ? (
                    <>
                        <Box
                            className={`${styles.jobStatus} ${job.status === 'draft' ? styles.draftStatus : styles.publishedStatus}`}
                        >
                            Post Status: <span>{job.status}</span>
                        </Box>
                        
                            <FormControl
                                className={styles.sidebarFormControl}
                            component="fieldset"
                            fullWidth
                        >
                            <InputLabel
                                className={styles.catLabel}
                                id="job-salary-label"
                                shrink={true}
                            >
                                Job Salary/Price
                            </InputLabel>
                            <TextField
                                variant="outlined"
                                fullWidth
                                value={job.salary || ''}
                                onChange={(e) => setJob({ ...job, salary: e.target.value })}
                                placeholder="Enter job salary or price"
                            />
                        </FormControl>

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
                            <RadioGroup
                                aria-label="job type"
                                name="job-type"
                                value={selectedJobType}
                                onChange={handleJobTypeChange}
                            >
                                {jobTypesList.map(type => (
                                    <FormControlLabel
                                        key={type.value}
                                        value={type.value}
                                        control={<Radio color="primary" />}
                                        label={type.label}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <FormControl
                            className={styles.sidebarFormControl}
                            component="fieldset"
                            fullWidth
                        >
                            <InputLabel
                                className={styles.catLabel}
                                id="job-categories-label"
                                shrink={true}
                            >
                                Job Categories
                            </InputLabel>
                            <FormGroup>
                                {categoriesList.map(category => (
                                    <FormControlLabel
                                        key={category.value}
                                        control={
                                            <Checkbox
                                                checked={selectedJobCategories.includes(category.value)}
                                                onChange={handleJobCategoriesChange}
                                                value={category.value}
                                                color="primary"
                                            />
                                        }
                                        label={category.label}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>

                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            mt={3}
                        >
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                className="tertiary small"
                            >
                                {job.status === 'draft' ? 'Save' : 'Switch to Draft'}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveAndPublish}
                            >
                                {job.status === 'draft' ? 'Save and Publish' : 'Save'}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box 
                            className={styles.jobDetails}
                        >
                            <Typography
                                variant="h3"
                                className={styles.jobDetailsTitle}
                            >
                                Salary:
                            </Typography>
                            <Typography
                                variant="body2"
                                className={styles.jobDetailsValue}
                            >
                                {job.salary}
                            </Typography>
                        </Box>

                        <Box className={styles.jobDetails}>
                            <Typography
                                variant="h3"
                                className={styles.jobDetailsTitle}
                            >
                                Job Type:
                            </Typography>
                            <Typography
                                variant="body2"
                                className={styles.jobDetailsValue}
                                dangerouslySetInnerHTML={{ __html: getLabels([job.type], jobTypesList, 'paragraph') }}
                             />
                        </Box>

                        <Box className={styles.jobDetails}>
                            <Typography
                                variant="h3"
                                className={styles.jobDetailsTitle}
                            >
                                Job Categories:
                            </Typography>
                            <Typography
                                variant="body2"
                                className={styles.jobDetailsValue}
                                dangerouslySetInnerHTML={{ __html: getLabels(job.categories, categoriesList, 'paragraph') }}
                             />
                        </Box>
                    </>
                )}
            </Sidebar>

            <ContentContainer>
                <NextLink href={`/profile/${job.userId}`}>Back to Profile</NextLink>
                
                {canEditProfile() ? (
                    <Box className={styles.jobEditorContainer}>
                        <FormControl
                            className={styles.sidebarFormControl}
                            component="fieldset"
                            fullWidth
                        >
                            <InputLabel
                                className={styles.jobTitleLabel}
                                id="job-title-label"
                                shrink={true}
                            >
                                Job Title
                            </InputLabel>
                            <TextField
                                className={styles.jobTitleValue}
                                variant="outlined"
                                fullWidth
                                value={job.title || 'Job Title'}
                                onChange={(e) => setJob({ ...job, title: e.target.value })}
                                placeholder="Job Title..."
                            />
                        </FormControl>

                        <RichTextEditorProvider 
                            editor={editor}
                            className={styles.tiptapEditor}
                        >
                            <RichTextField
                                controls={
                                    <MenuControlsContainer>
                                        <MenuSelectHeading />
                                        <MenuDivider />
                                        <MenuButtonBold />
                                        <MenuButtonItalic />
                                        <MenuButtonUnderline />
                                        <MenuDivider />
                                        <MenuButtonEditLink />
                                        <MenuDivider />
                                        <MenuButtonBulletedList />
                                        <MenuButtonOrderedList />
                                        <MenuButtonBlockquote />
                                        <MenuDivider />
                                        <MenuButtonSubscript />
                                        <MenuButtonSuperscript />
                                        <MenuButtonHorizontalRule />
                                        <MenuDivider />
                                        <MenuButtonRedo />
                                        <MenuButtonUndo />
                                    </MenuControlsContainer>
                                }
                            />
                            <LinkBubbleMenu editor={editor} />
                        </RichTextEditorProvider>

                    </Box>
                ) : (
                    <Box className={`${styles.jobContentContainer} entry-content`}>
                        <Typography
                            variant="h1"
                            className={styles.jobTitle}
                        >
                            {job.title}
                        </Typography>
                        <div
                            className={styles.jobContent}
                            dangerouslySetInnerHTML={{ __html: job.description }} 
                        />
                    </Box>
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

export default EditJob;