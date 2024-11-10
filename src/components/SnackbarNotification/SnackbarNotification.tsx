// SnackbarNotification.tsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function SnackbarNotification({ 
    open, 
    message, 
    onClose, 
    severity = 'success' 
}: {
    open: boolean;
    message: string;
    onClose: () => void;
    severity: 'success';
}) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
            >
                {message}
            </Alert>
        </Snackbar>
    );
};