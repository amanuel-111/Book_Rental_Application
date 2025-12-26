import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import styles from '../styles/auth.module.css';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'OWNER'], 'Please select a role'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
}).refine((data) => {
  if (data.role === 'OWNER') {
    return data.firstName && data.lastName;
  }
  return true;
}, {
  message: 'First name and last name are required for owners',
  path: ['firstName']
});

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser, user } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      location: '',
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await registerUser(data);
    
    if (result.success) {
      if (result.user.role === 'OWNER') {
        router.push('/pending-approval');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <div className={styles.authContainer}>
        <div className={styles.authLeft}>
          <div className={styles.brandSection}>
            <h1 className={styles.brandTitle}>BookRent</h1>
            <p className={styles.brandSubtitle}>Join Our Reading Community</p>
            <ul className={styles.brandFeatures}>
              <li>Access thousands of books</li>
              <li>Rent books at great prices</li>
              <li>Share your collection</li>
              <li>Build your reading network</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.authRight}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>Join thousands of book lovers today</p>
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
                      placeholder="Create a strong password"
                    />
                  )}
                />
                {errors.password && (
                  <span className={styles.errorMessage}>{errors.password.message}</span>
                )}
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>I want to</label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div className={styles.roleGrid}>
                      <div 
                        className={`${styles.roleOption} ${field.value === 'USER' ? styles.selected : ''}`}
                        onClick={() => field.onChange('USER')}
                      >
                        <div className={styles.roleTitle}>📖 Rent Books</div>
                        <div className={styles.roleDescription}>Browse and rent books from others</div>
                      </div>
                      <div 
                        className={`${styles.roleOption} ${field.value === 'OWNER' ? styles.selected : ''}`}
                        onClick={() => field.onChange('OWNER')}
                      >
                        <div className={styles.roleTitle}>📚 Share Books</div>
                        <div className={styles.roleDescription}>Upload your books for rent</div>
                      </div>
                    </div>
                  )}
                />
                {errors.role && (
                  <span className={styles.errorMessage}>{errors.role.message}</span>
                )}
              </div>
              
              {selectedRole === 'OWNER' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>First Name</label>
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
                            placeholder="First name"
                          />
                        )}
                      />
                      {errors.firstName && (
                        <span className={styles.errorMessage}>{errors.firstName.message}</span>
                      )}
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Last Name</label>
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
                            placeholder="Last name"
                          />
                        )}
                      />
                      {errors.lastName && (
                        <span className={styles.errorMessage}>{errors.lastName.message}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Phone (Optional)</label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="tel"
                            className={styles.input}
                            placeholder="Phone number"
                          />
                        )}
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Location (Optional)</label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={styles.input}
                            placeholder="City, State"
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Address (Optional)</label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={styles.input}
                          placeholder="Full address"
                        />
                      )}
                    />
                  </div>
                </>
              )}
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className={styles.switchAuth}>
              <span>Already have an account? </span>
              <button onClick={() => router.push('/login')}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}