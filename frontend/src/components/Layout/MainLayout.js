import Header from './Header';
import Footer from './Footer';
import styles from '../../styles/home.module.css';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.homeContainer}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;