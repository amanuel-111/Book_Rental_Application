import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/auth.module.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data.email, data.password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const quickLogin = (email, password) => {
    onSubmit({ email, password });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <div className={styles.brandSection}>
          <h1 className={styles.brandTitle}>BookRent</h1>
          <p className={styles.brandSubtitle}>Your Digital Library Awaits</p>
          <ul className={styles.brandFeatures}>
            <li>Discover thousands of books</li>
            <li>Rent at affordable prices</li>
            <li>Earn by sharing your books</li>
            <li>Manage your reading journey</li>
          </ul>
        </div>
      </div>
      
      <div className={styles.authRight}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>
          
          {error && (
            <div className={`${styles.alert} ${styles.error}`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="Enter your email"
                  />
                )}
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email.message}</span>
              )}
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="Enter your password"
                  />
                )}
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password.message}</span>
              )}
            </div>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className={styles.switchAuth}>
            <span>Don't have an account? </span>
            <button onClick={() => router.push('/register')}>
              Create Account
            </button>
          </div>
          
          <div className={styles.demoAccounts}>
            <div className={styles.demoTitle}>Quick Demo Login:</div>
            <div className={styles.demoAccount}>
              <span>Admin:</span>
              <button 
                onClick={() => quickLogin('admin@bookrental.com', 'admin123')}
                style={{ background: 'none', border: 'none', color: '#22D3EE', cursor: 'pointer', textDecoration: 'underline' }}
              >
                admin@bookrental.com
              </button>
            </div>
            <div className={styles.demoAccount}>
              <span>Owner:</span>
              <button 
                onClick={() => quickLogin('owner@example.com', 'owner123')}
                style={{ background: 'none', border: 'none', color: '#22D3EE', cursor: 'pointer', textDecoration: 'underline' }}
              >
                owner@example.com
              </button>
            </div>
            <div className={styles.demoAccount}>
              <span>User:</span>
              <button 
                onClick={() => quickLogin('user@example.com', 'user123')}
                style={{ background: 'none', border: 'none', color: '#22D3EE', cursor: 'pointer', textDecoration: 'underline' }}
              >
                user@example.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}