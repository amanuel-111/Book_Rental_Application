import MainLayout from '../components/Layout/MainLayout';
import styles from '../styles/home.module.css';

export default function Contact() {
  return (
    <MainLayout>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📧</span>
              <h3 className={styles.featureTitle}>Email Us</h3>
              <p className={styles.featureDescription}>
                hello@bookrent.com<br/>
                support@bookrent.com
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📞</span>
              <h3 className={styles.featureTitle}>Call Us</h3>
              <p className={styles.featureDescription}>
                +1 (555) 123-4567<br/>
                Mon-Fri 9AM-6PM EST
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📍</span>
              <h3 className={styles.featureTitle}>Visit Us</h3>
              <p className={styles.featureDescription}>
                123 Library Street<br/>
                Book City, BC 12345
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}