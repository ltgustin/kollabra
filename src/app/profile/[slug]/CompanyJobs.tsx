import React from 'react';
import { Container, Typography } from '@mui/material';
import styles from './Profile.module.scss';

const CompanyJobs = () => {
    return (
        <Container className={`${styles.companyJobs} container`}>
            <Typography variant="h2">Jobs</Typography>
        </Container>
    );
};

export default CompanyJobs;