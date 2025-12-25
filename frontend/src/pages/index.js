import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import styles from '../styles/home.module.css';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Your Digital Library Awaits
          </h1>
          <p className={styles.heroSubtitle}>
            Discover, rent, and share amazing books with our community of book lovers. 
            Access thousands of titles at your fingertips.
          </p>
          <div className={styles.heroButtons}>
            {user ? (
              <button 
                className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                onClick={() => handleNavigation('/dashboard')}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                  onClick={() => handleNavigation('/register')}
                >
                  Get Started Free
                </button>
                <button 
                  className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
                  onClick={() => handleNavigation('/books')}
                >
                  Browse Books
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Why Choose BookRent?</h2>
          <p className={styles.sectionSubtitle}>
            Experience the future of book sharing with our innovative platform
          </p>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📚</span>
              <h3 className={styles.featureTitle}>Vast Library</h3>
              <p className={styles.featureDescription}>
                Access thousands of books across all genres. From bestsellers to hidden gems, 
                find your next favorite read.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>💰</span>
              <h3 className={styles.featureTitle}>Affordable Rentals</h3>
              <p className={styles.featureDescription}>
                Rent books at a fraction of the cost. Enjoy premium content without 
                breaking the bank.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🤝</span>
              <h3 className={styles.featureTitle}>Share & Earn</h3>
              <p className={styles.featureDescription}>
                Upload your own books and earn money when others rent them. 
                Turn your library into income.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📱</span>
              <h3 className={styles.featureTitle}>Easy to Use</h3>
              <p className={styles.featureDescription}>
                Simple, intuitive interface makes finding and renting books 
                a breeze on any device.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔒</span>
              <h3 className={styles.featureTitle}>Secure Platform</h3>
              <p className={styles.featureDescription}>
                Your transactions and personal information are protected with 
                enterprise-grade security.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🌟</span>
              <h3 className={styles.featureTitle}>Quality Assured</h3>
              <p className={styles.featureDescription}>
                All books and owners are verified to ensure you get the best 
                reading experience every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContainer}>
          <h2 className={styles.sectionTitle}>Join Our Growing Community</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Books Available</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>5K+</span>
              <span className={styles.statLabel}>Happy Readers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1K+</span>
              <span className={styles.statLabel}>Book Owners</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Books Rented</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.howItWorksContainer}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Get started in just a few simple steps
          </p>
          
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Sign Up</h3>
              <p className={styles.stepDescription}>
                Create your free account as a reader or book owner. 
                It takes less than a minute to get started.
              </p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Browse & Discover</h3>
              <p className={styles.stepDescription}>
                Explore our vast collection of books. Use filters to find 
                exactly what you're looking for.
              </p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Rent & Read</h3>
              <p className={styles.stepDescription}>
                Rent books instantly and start reading. Return them when 
                you're done or extend your rental period.
              </p>
            </div>
            
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Share & Earn</h3>
              <p className={styles.stepDescription}>
                Upload your own books to earn money. Help others discover 
                great reads while generating income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Start Reading?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of book lovers who have already discovered the joy of 
            digital book sharing. Start your reading journey today!
          </p>
          <div className={styles.ctaButtons}>
            {user ? (
              <button 
                className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                onClick={() => handleNavigation('/dashboard')}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                  onClick={() => handleNavigation('/register')}
                >
                  Start Reading Now
                </button>
                <button 
                  className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
                  onClick={() => handleNavigation('/login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}