import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { user, loading, ability } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }

      if (requiredPermission && ability) {
        const { action, subject, field } = requiredPermission;
        if (!ability.can(action, subject, field)) {
          router.push('/unauthorized');
          return;
        }
      }

      // Check if owner is approved
      if (user.role === 'OWNER' && !user.owner_approved) {
        router.push('/pending-approval');
        return;
      }
    }
  }, [user, loading, router, requiredRole, requiredPermission, ability]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  if (requiredPermission && ability) {
    const { action, subject, field } = requiredPermission;
    if (!ability.can(action, subject, field)) {
      return null;
    }
  }

  return children;
};

export default ProtectedRoute;