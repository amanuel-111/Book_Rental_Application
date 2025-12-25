import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const StatCard = ({ title, value, icon, color = '#667eea' }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div>
        <div style={{
          color: '#718096',
          fontSize: '0.875rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#2d3748'
        }}>
          {value}
        </div>
      </div>
      <div style={{ 
        fontSize: '2rem',
        color: color
      }}>
        {icon}
      </div>
    </div>
  </div>
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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem' 
    }}>
      <StatCard
        title="Total Books"
        value={stats.totalBooks || 0}
        icon="📚"
        color="#667eea"
      />
      <StatCard
        title="Book Owners"
        value={stats.totalOwners || 0}
        icon="👥"
        color="#764ba2"
      />
      <StatCard
        title="Total Rentals"
        value={stats.totalRentals || 0}
        icon="📋"
        color="#48bb78"
      />
    </div>
  );

  const renderOwnerDashboard = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem' 
    }}>
      <StatCard
        title="My Books"
        value={stats.myBooks || 0}
        icon="📖"
        color="#667eea"
      />
      <StatCard
        title="My Rentals"
        value={stats.myRentals || 0}
        icon="📋"
        color="#764ba2"
      />
    </div>
  );

  const renderUserDashboard = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1.5rem' 
    }}>
      <StatCard
        title="Available Books"
        value={stats.availableBooks || 0}
        icon="🔍"
        color="#667eea"
      />
      <StatCard
        title="My Rentals"
        value={stats.myRentals || 0}
        icon="📋"
        color="#764ba2"
      />
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#2d3748',
            marginBottom: '0.5rem' 
          }}>
            Welcome back, {user?.first_name || user?.email}!
          </h1>
          <p style={{ color: '#718096', fontSize: '1rem' }}>
            {user?.role === 'ADMIN' && 'Manage the book rental system'}
            {user?.role === 'OWNER' && 'Manage your books and track revenue'}
            {user?.role === 'USER' && 'Discover and rent amazing books'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
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