'use client';

import styles from './ContentContainer.module.scss';

export default function ContentContainer({ children }: { children: React.ReactNode }) {

    return (
        <section className={`${styles.contentContainer} d-flex`}>
            {children}
        </section>
    );
};