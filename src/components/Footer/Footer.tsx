import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer () {
    return (
        <footer className={`${styles.footer} container pt-20 pb-20 mt-30`}>
            <p className="text-center">@{new Date().getFullYear()} Kollabra. All Rights Reserved | <Link href="/privacy-policy">Privacy Policy</Link> | <Link href="/contact-us">Contact Us</Link></p>
        </footer>
    );
};
