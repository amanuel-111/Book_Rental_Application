import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/auth.module.css';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'OWNER') {
      router.push('/dashboard');
      return;
    }

    if (user.owner_approved) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!user || user.role !== 'OWNER' || user.owner_approved) {
    return null;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <div className={styles.brandSection}>
          <h1 className={styles.brandTitle}>BookRent</h1>
          <p className={styles.brandSubtitle}>Your account is being reviewed</p>
          <ul className={styles.brandFeatures}>
            <li>Account created successfully</li>
            <li>Pending admin approval</li>
            <li>You'll be notified via email</li>
            <li>Usually takes 24-48 hours</li>
          </ul>
        </div>
      </div>
      
      <div className={styles.authRight}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Account Pending Approval</h2>
            <p className={styles.formSubtitle}>
              Thank you for registering as a book owner!
            </p>
          </div>
          
          <div style={{
            background: 'rgba(34, 211, 238, 0.1)',
            color: '#22D3EE',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ marginBottom: '1rem', color: '#F4F4F4' }}>
              Your account is under review
            </h3>
            <p style={{ lineHeight: '1.6', color: '#64748B' }}>
              Our admin team is reviewing your book owner application. 
              You'll receive an email notification once your account is approved. 
              This process typically takes 24-48 hours.
            </p>
          </div>

          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ color: '#F4F4F4', marginBottom: '1rem' }}>
              What happens next?
            </h4>
            <ul style={{ 
              color: '#64748B', 
              lineHeight: '1.6',
              paddingLeft: '1.5rem'
            }}>
              <li>Admin reviews your application</li>
              <li>You receive approval notification</li>
              <li>Access to owner dashboard unlocked</li>
              <li>Start uploading and managing books</li>
            </ul>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexDirection: 'column'
          }}>
            <button
              onClick={handleGoHome}
              className={styles.submitButton}
            >
              Browse Books While Waiting
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'transparent',
                color: '#64748B',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#22D3EE';
                e.target.style.color = '#22D3EE';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.color = '#64748B';
              }}
            >
              Sign Out
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem',
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Need help? Contact us at{' '}
              <span style={{ color: '#22D3EE' }}>support@bookrent.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}