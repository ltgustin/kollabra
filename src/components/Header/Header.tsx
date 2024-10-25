'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/assets/logo.svg';
import { Button, Avatar, Popover, Button as MuiButton } from '@mui/material';
import styles from './Header.module.scss';
import { useAuth } from '../../hooks/useAuth';

import { useUserProfile } from '@/hooks/UserProfileContext';

export default function Header() {
    const userProfile = useUserProfile();
    const { user, isAuthenticated } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); 

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget); // Set anchor for Popover
    };

    const handleClose = () => {
        setAnchorEl(null); // Close Popover
    };

    console.log(userProfile);

    const open = Boolean(anchorEl); // Determine if Popup is open

    return (
        <header className={`${styles.header} container d-flex f-j-sb`}>
            <Link className={styles.logo} href="/">
                <Logo width="209" alt="Kollabra Logo" />
            </Link>

            {isAuthenticated ? (
                <div className={styles.headerAvatarWrap}>

                    <Link href="/dashboard" className={styles.navLink}>
                        Find Creative Jobs
                    </Link>

                    {userProfile?.profilePhoto &&
                        <MuiButton 
                            onClick={handleClick}
                            className={styles.headerAvatar} 
                        >
                            <Avatar src={userProfile?.profilePhoto} alt={userProfile?.displayName} className={styles["avatar"]} />
                        </MuiButton>
                    }
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <div className="profile-name">{userProfile?.displayName}</div>
                        <MuiButton 
                            component={Link} 
                            href={`/profile/${userProfile?.displayName}`} 
                            onClick={handleClose}
                        >
                            Edit Profile
                        </MuiButton>
                    </Popover>
                </div>
            ) : (
                <Link href="/signin" passHref>
                    <Button variant="contained" color="primary">Sign In</Button>
                </Link>
            )}
        </header>
    );
};