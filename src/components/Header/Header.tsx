'use client';

import Link from 'next/link';
import Logo from '@/assets/logo.svg';
import styles from './Header.module.scss';

export default function Header() {
    return (
        <header className={styles.header}>
            <Link className={styles.logo} href="/">
                <Logo width="209" alt="Kollabra Logo" />
            </Link>
        </header>
    );
};