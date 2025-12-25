import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/header.module.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => handleNavigation('/')}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>BookRent</span>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('/')}
          >
            Home
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('/books')}
          >
            Browse Books
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('/about')}
          >
            About
          </button>
          <button 
            className={styles.navLink}
            onClick={() => handleNavigation('/contact')}
          >
            Contact
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className={styles.authSection}>
          {user ? (
            <div className={styles.userMenu}>
              <button 
                className={styles.dashboardBtn}
                onClick={() => handleNavigation('/dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={styles.logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button 
                className={styles.loginBtn}
                onClick={() => handleNavigation('/login')}
              >
                Sign In
              </button>
              <button 
                className={styles.registerBtn}
                onClick={() => handleNavigation('/register')}
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={mobileMenuOpen ? styles.closeIcon : styles.menuIcon}>
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNav}>
            <button 
              className={styles.mobileNavLink}
              onClick={() => handleNavigation('/')}
            >
              Home
            </button>
            <button 
              className={styles.mobileNavLink}
              onClick={() => handleNavigation('/books')}
            >
              Browse Books
            </button>
            <button 
              className={styles.mobileNavLink}
              onClick={() => handleNavigation('/about')}
            >
              About
            </button>
            <button 
              className={styles.mobileNavLink}
              onClick={() => handleNavigation('/contact')}
            >
              Contact
            </button>
          </div>
          
          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <button 
                  className={styles.mobileDashboardBtn}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={styles.mobileLogoutBtn}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className={styles.mobileLoginBtn}
                  onClick={() => handleNavigation('/login')}
                >
                  Sign In
                </button>
                <button 
                  className={styles.mobileRegisterBtn}
                  onClick={() => handleNavigation('/register')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;