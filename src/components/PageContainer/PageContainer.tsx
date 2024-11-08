'use client';

import styles from './PageContainer.module.scss';

export default function PageContainer({ children }: { children: React.ReactNode }) {

    return (
        <section className={`${styles.pageContainer} d-flex`}>
            {children}
        </section>
    );
};