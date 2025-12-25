import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
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