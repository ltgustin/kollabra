"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './EditJob.module.scss';

import { 
    useEditor, 
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    MenuSelectHeading,
    MenuButtonBold,
    MenuButtonItalic,
    MenuButtonUnderline,
    MenuButtonBulletedList,
    MenuButtonBlockquote,
    MenuDivider,
    MenuButtonRedo,
    MenuButtonUndo,
    MenuControlsContainer,
    RichTextEditorProvider,
    RichTextField,
} from "mui-tiptap";

interface JobProps {
    params: {
        id: string;
    };
}

const EditJob = ({ params }: JobProps) => {
    const router = useRouter();
    const { id } = params;
    const [job, setJob] = useState(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        onUpdate: ({ editor }) => {
            setJob((prevJob) => ({ ...prevJob, description: editor.getHTML() }));
        },
    });

    useEffect(() => {
        const fetchJob = async () => {
            const docRef = doc(db, 'job', id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const jobData = docSnap.data();
                setJob(jobData);
                editor?.commands.setContent(jobData.description || '');
            } else {
                console.error('No such document!');
            }
        };

        fetchJob();
    }, [router, id, editor]);

    const handleSave = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            updatedAt: new Date(),
        });
        alert('Job updated successfully');
    };

    const handleSaveAndPublish = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            status: 'published',
            updatedAt: new Date(),
        });
        alert('Job published successfully');
    };

    if (!job) return <div>Loading...</div>;

    return (
        <div className={styles.jobEditorContainer}>
            <input
                className={styles.jobTitle}
                type="text"
                value={job.title || ''}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
            />

            <RichTextEditorProvider editor={editor}>
                <RichTextField
                    controls={
                        <MenuControlsContainer>
                            <MenuSelectHeading />
                            <MenuDivider />
                            <MenuButtonBold />
                            <MenuButtonItalic />
                            <MenuButtonUnderline />
                            <MenuButtonBulletedList />
                            <MenuButtonBlockquote />
                            <MenuButtonRedo />
                            <MenuButtonUndo />
                        </MenuControlsContainer>
                    }
                />
            </RichTextEditorProvider>

            <button onClick={handleSave}>Save</button>
            <button onClick={handleSaveAndPublish}>Save and Publish</button>
        </div>
    );
};

export default EditJob;