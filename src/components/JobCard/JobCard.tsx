// PortfolioItem.tsx
import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import styles from './JobCard.module.scss';

export default function JobCard({ 
    job, 
    canEditProfile, 
    setEditingJob,
    setIsJobPopupOpen
}) {
    return (
        <Box>
            <Typography variant="h4">{job.title}</Typography>
            <Typography variant="body1">{job.description}</Typography>
            {canEditProfile ? (
                <Box>
                    <IconButton onClick={() => setEditingJob(job)}>
                    <EditIcon />
                </IconButton>
                <IconButton>
                    <DeleteIcon />
                    </IconButton>
                </Box>
            ) : null}
        </Box>
    );
};