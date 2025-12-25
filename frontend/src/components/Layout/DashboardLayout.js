import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/dashboard.module.css';

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const getMenuItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: '📊',
        path: '/dashboard',
        roles: ['ADMIN', 'OWNER', 'USER']
      }
    ];

    if (user?.role === 'ADMIN') {
      items.push(
        {
          text: 'Book Owners',
          icon: '👥',
          path: '/dashboard/owners',
          roles: ['ADMIN']
        },
        {
          text: 'All Books',
          icon: '📚',
          path: '/dashboard/books',
          roles: ['ADMIN']
        },
        {
          text: 'All Rentals',
          icon: '📋',
          path: '/dashboard/rentals',
          roles: ['ADMIN']
        },
        {
          text: 'Statistics',
          icon: '📈',
          path: '/dashboard/stats',
          roles: ['ADMIN']
        }
      );
    }

    if (user?.role === 'OWNER') {
      items.push(
        {
          text: 'My Books',
          icon: '📖',
          path: '/dashboard/my-books',
          roles: ['OWNER']
        },
        {
          text: 'My Rentals',
          icon: '📋',
          path: '/dashboard/my-rentals',
          roles: ['OWNER']
        },
        {
          text: 'Revenue',
          icon: '💰',
          path: '/dashboard/revenue',
          roles: ['OWNER']
        }
      );
    }

    if (user?.role === 'USER') {
      items.push(
        {
          text: 'Browse Books',
          icon: '🔍',
          path: '/dashboard/browse',
          roles: ['USER']
        },
        {
          text: 'My Rentals',
          icon: '📋',
          path: '/dashboard/my-rentals',
          roles: ['USER']
        }
      );
    }

    items.push(
      {
        text: 'Categories',
        icon: '🏷️',
        path: '/dashboard/categories',
        roles: ['ADMIN', 'OWNER', 'USER']
      },
      {
        text: 'Profile',
        icon: '👤',
        path: '/dashboard/profile',
        roles: ['ADMIN', 'OWNER', 'USER']
      }
    );

    return items.filter(item => item.roles.includes(user?.role));
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.active : ''}`}
        onClick={handleDrawerToggle}
      />
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.brandTitle}>BookRent</h1>
        </div>
        
        <nav className={styles.nav}>
          {getMenuItems().map((item) => (
            <button
              key={item.text}
              className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.text}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className={styles.mobileMenuButton}
              onClick={handleDrawerToggle}
            >
              ☰
            </button>
            <h2 className={styles.topBarTitle}>
              {user?.role === 'ADMIN' && 'Admin Dashboard'}
              {user?.role === 'OWNER' && 'Owner Dashboard'}
              {user?.role === 'USER' && 'User Dashboard'}
            </h2>
          </div>
          
          <div className={styles.userSection}>
            <span className={styles.userName}>
              {user?.first_name || user?.email}
            </span>
            <div 
              className={styles.userAvatar}
              onClick={handleProfileToggle}
            >
              {getUserInitials()}
            </div>
            
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    router.push('/dashboard/profile');
                    setDropdownOpen(false);
                  }}
                >
                  <span className={styles.dropdownIcon}>⚙️</span>
                  Profile Settings
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  <span className={styles.dropdownIcon}>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Page Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;