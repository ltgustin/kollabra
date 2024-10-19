import styles from './Navbar.module.scss';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <h1 className={styles.title}>My Navbar</h1>
        </nav>
    );
};

export default Navbar;