import { useRouter } from 'next/router';
import styles from '../../styles/footer.module.css';

const Footer = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>📚</span>
              <span className={styles.logoText}>BookRent</span>
            </div>
            <p className={styles.description}>
              Your digital library for discovering, renting, and sharing amazing books. 
              Join thousands of book lovers in our community.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">📘</a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">🐦</a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/')}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/books')}
                >
                  Browse Books
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/about')}
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/contact')}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Services</h3>
            <ul className={styles.linkList}>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/register')}
                >
                  Rent Books
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/register')}
                >
                  Share Your Books
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/categories')}
                >
                  Book Categories
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleNavigation('/help')}
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Get in Touch</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                <span>hello@bookrent.com</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>123 Library St, Book City, BC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © 2024 BookRent. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              <button 
                className={styles.legalLink}
                onClick={() => handleNavigation('/privacy')}
              >
                Privacy Policy
              </button>
              <button 
                className={styles.legalLink}
                onClick={() => handleNavigation('/terms')}
              >
                Terms of Service
              </button>
              <button 
                className={styles.legalLink}
                onClick={() => handleNavigation('/cookies')}
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;