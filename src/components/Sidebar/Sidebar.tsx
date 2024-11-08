'use client';

import styles from './Sidebar.module.scss';

export default function Sidebar({children}) {
    
    return (
        <section className={`${styles.sidebar} container d-flex`}>
            {children}
        </section>
    );
};