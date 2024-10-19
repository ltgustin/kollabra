import styles from './ProfileCard.module.scss';

export default function ProfileCard() {
    return (
        <div className={styles.card}>
            <h2 className={styles.name}>John Doe</h2>
        </div>
    );
}