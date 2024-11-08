import React, { useState } from 'react'; // Added useState import

import { Modal, Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import styles from './OnboardingModal.module.scss';
import onboardingImage from '@/assets/onboarding.jpg'; 
import CompanyIcon from '@/assets/company.svg';
import CreativeIcon from '@/assets/creative.svg';

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
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(27, 1, 87, 0.9)',
                    },
                },
            }}
        >
            <Box className={styles["modal-box"]}>
                <Image
                    src={onboardingImage}
                    alt="Onboarding"
                    className={styles["onboarding-image"]}
                    layout="responsive"
                    width={545}
                    height={345}
                />
                
                <Box className={styles["onboarding-text"]}>
                    <Typography variant="h4" component="h2">Welcome to Kollabra!</Typography>
                    <Typography sx={{ mt: 2 }}>Let's decide if you are looking to hire a creative or are you a creative looking to get hired? </Typography>

                    <div className={styles["account-type-radio"]}>
                        <label 
                            className={`${styles["radio-label"]} ${accountType === 'Company' ? styles["selected"] : ''}`}
                        >
                            <input
                                type="radio"
                                name="account_type"
                                value="Company"
                                checked={accountType === 'Company'}
                                onChange={() => setAccountType('Company')}
                                className={styles["radio-input"]}
                            />
                            <CompanyIcon />
                            <span>Company</span>
                        </label>
                        <label 
                            className={`${styles["radio-label"]} ${accountType === 'Creative' ? styles["selected"] : ''}`}
                        >
                            <input
                                type="radio"
                                name="account_type"
                                value="Creative"
                                checked={accountType === 'Creative'}
                                onChange={() => setAccountType('Creative')}
                                className={styles["radio-input"]}
                            />
                            <CreativeIcon />
                            <span>Creative</span>
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
                        Continue to Profile
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default OnboardingModal;