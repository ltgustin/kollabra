// SnackbarNotification.tsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const SnackbarNotification = ({ open, message, onClose, severity='success' }) => {
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

export default SnackbarNotification;