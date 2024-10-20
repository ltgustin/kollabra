import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import styles from './OnboardingModal.module.scss';

interface OnboardingModalProps {
    onComplete: () => void; 
    open: boolean;
    onClose: () => void; 
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, open, onClose }) => {
    return (
        <Modal
            open={open}
            onClose={(_, reason) => reason === 'backdropClick'}
        >
            <Box className={styles["modal-box"]}>
                <Typography variant="h6" component="h2">
                    Welcome to the Onboarding!
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    This is some random text to guide you through the onboarding process.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        onComplete();
                        onClose();
                    }}
                    sx={{ mt: 2 }}
                >
                    Complete Onboarding
                </Button>
            </Box>
        </Modal>
    );
};

export default OnboardingModal;