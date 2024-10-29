'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/assets/logo.svg';
import { Button, Avatar, Button as MuiButton, Menu, MenuItem, IconButton, Tooltip, Typography, Box } from '@mui/material';
import styles from './Header.module.scss';
import { useAuth } from '../../hooks/useAuth';

import { useUserProfile } from '@/hooks/UserProfileContext';

export default function Header() {
    const userProfile = useUserProfile();
    const { user, isAuthenticated, signOut } = useAuth();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null); 

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSignOut = () => {
        signOut();
    }

    return (
        <header className={`${styles.header} container d-flex f-j-sb`}>
            <Link className={styles.logo} href="/">
                <Logo width="209" alt="Kollabra Logo" />
            </Link>

            {isAuthenticated ? (
                <div className={styles.headerAvatarWrap}>


                    {userProfile?.profilePhoto &&
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 0 }}>
                            <Link href="/dashboard" className={styles.navLink}>
                                Find Creative Jobs
                            </Link>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={userProfile?.displayName} src={userProfile?.profilePhoto} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem 
                                    component={Link} 
                                    href={`/profile/${userProfile?.slug}`}
                                    onClick={handleCloseUserMenu}
                                >
                                    <Typography
                                        sx={{ textAlign: 'center' }}
                                    >Profile</Typography>
                                </MenuItem>

                                <MenuItem 
                                    component={Link} 
                                    href="/dashboard"
                                    onClick={handleCloseUserMenu}
                                >
                                    <Typography
                                        sx={{ textAlign: 'center' }}
                                    >Dashboard</Typography>
                                </MenuItem>

                                <MenuItem onClick={handleSignOut}>
                                    <Typography 
                                        sx={{ textAlign: 'center' }}
                                    >Signout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    }  
                </div>
            ) : (
                <Link href="/signin" passHref>
                    <Button variant="contained" color="primary">Sign In</Button>
                </Link>
            )}
        </header>
    );
};