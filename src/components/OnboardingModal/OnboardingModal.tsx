import React, { useState } from 'react'; // Added useState import

import { Modal, Box, Typography, Button } from '@mui/material';
import styles from './OnboardingModal.module.scss';

interface OnboardingModalProps {
    onComplete: () => void; 
    open: boolean;
    onClose: () => void; 
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, open, onClose }) => {
    const [accountType, setAccountType] = useState<string>('');

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
                
                <div className={styles["account-type-radio"]}>
                    <label>
                        <input
                            type="radio"
                            name="account_type"
                            value="Company"
                            checked={accountType === 'Company'}
                            onChange={() => setAccountType('Company')}
                        />
                        Company
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="account_type"
                            value="Creative"
                            checked={accountType === 'Creative'}
                            onChange={() => setAccountType('Creative')}
                        />
                        Creative
                    </label>
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        onComplete(accountType);
                        onClose();
                    }}
                    sx={{ mt: 2 }}
                    disabled={!accountType}
                >
                    Complete Onboarding
                </Button>
            </Box>
        </Modal>
    );
};

export default OnboardingModal;