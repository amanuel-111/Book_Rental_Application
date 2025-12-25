import MainLayout from '../components/Layout/MainLayout';
import styles from '../styles/home.module.css';

export default function About() {
  return (
    <MainLayout>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>About BookRent</h1>
          <p className={styles.heroSubtitle}>
            Connecting book lovers through the power of sharing
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '2rem' }}>
              BookRent was born from a simple idea: books should be accessible to everyone. 
              We believe that great stories and knowledge shouldn't be limited by budget or location.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '2rem' }}>
              Our platform connects book owners with readers, creating a sustainable ecosystem 
              where everyone benefits. Readers get access to affordable books, while owners 
              can monetize their personal libraries.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}>
              Join us in building a world where every book finds its reader, and every reader 
              finds their next great adventure.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}