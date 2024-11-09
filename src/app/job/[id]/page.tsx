"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface JobProps {
    params: {
        id: string;
    };
}

const EditJob = ({ params }: JobProps) => {
    const router = useRouter();
    const { id } = params;
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            const docRef = doc(db, 'job', id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setJob(docSnap.data());
            } else {
                console.error('No such document!');
            }
        };

        fetchJob();
    }, [router, id]);

    const handleSave = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            updatedAt: new Date(),
        });
        alert('Job saved');
    };

    const handleSaveAndPublish = async () => {
        if (!id) return; // Ensure id is available
        const docRef = doc(db, 'job', id as string);
        await updateDoc(docRef, {
            ...job,
            status: 'published',
            updatedAt: new Date(),
        });
        alert('Job published');
    };

    if (!job) return <div>Loading...</div>;

    return (
        <div>
            <h1>Edit Job</h1>
            <input
                type="text"
                value={job.title || ''}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
            />
            <textarea
                value={job.description || ''}
                onChange={(e) => setJob({ ...job, description: e.target.value })}
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={handleSaveAndPublish}>Save and Publish</button>
        </div>
    );
};

export default EditJob;