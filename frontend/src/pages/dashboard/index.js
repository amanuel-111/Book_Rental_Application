import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert
} from '@mui/material';
import {
  Book,
  People,
  Receipt,
  AttachMoney
} from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'ADMIN') {
        const [booksRes, ownersRes, rentalsRes] = await Promise.all([
          api.get('/books?limit=1'),
          api.get('/owners?limit=1'),
          api.get('/rentals?limit=1')
        ]);
        
        setStats({
          totalBooks: booksRes.data.pagination?.totalItems || 0,
          totalOwners: ownersRes.data.pagination?.totalItems || 0,
          totalRentals: rentalsRes.data.pagination?.totalItems || 0
        });
      } else if (user?.role === 'OWNER') {
        const [booksRes, rentalsRes] = await Promise.all([
          api.get('/books?limit=1'),
          api.get('/rentals?limit=1')
        ]);
        
        setStats({
          myBooks: booksRes.data.pagination?.totalItems || 0,
          myRentals: rentalsRes.data.pagination?.totalItems || 0
        });
      } else if (user?.role === 'USER') {
        const [booksRes, rentalsRes] = await Promise.all([
          api.get('/books?limit=1'),
          api.get('/rentals?limit=1')
        ]);
        
        setStats({
          availableBooks: booksRes.data.pagination?.totalItems || 0,
          myRentals: rentalsRes.data.pagination?.totalItems || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const renderAdminDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Books"
          value={stats.totalBooks || 0}
          icon={<Book fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Book Owners"
          value={stats.totalOwners || 0}
          icon={<People fontSize="large" />}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Rentals"
          value={stats.totalRentals || 0}
          icon={<Receipt fontSize="large" />}
          color="success"
        />
      </Grid>
    </Grid>
  );

  const renderOwnerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="My Books"
          value={stats.myBooks || 0}
          icon={<Book fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="My Rentals"
          value={stats.myRentals || 0}
          icon={<Receipt fontSize="large" />}
          color="secondary"
        />
      </Grid>
    </Grid>
  );

  const renderUserDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="Available Books"
          value={stats.availableBooks || 0}
          icon={<Book fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StatCard
          title="My Rentals"
          value={stats.myRentals || 0}
          icon={<Receipt fontSize="large" />}
          color="secondary"
        />
      </Grid>
    </Grid>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.first_name || user?.email}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.role === 'ADMIN' && 'Manage the book rental system'}
            {user?.role === 'OWNER' && 'Manage your books and track revenue'}
            {user?.role === 'USER' && 'Discover and rent amazing books'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && (
          <>
            {user?.role === 'ADMIN' && renderAdminDashboard()}
            {user?.role === 'OWNER' && renderOwnerDashboard()}
            {user?.role === 'USER' && renderUserDashboard()}
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}