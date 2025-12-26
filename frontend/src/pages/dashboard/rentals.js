import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const RentalCard = ({ rental, onUpdateStatus }) => {
  const isOverdue = new Date(rental.due_date) < new Date() && rental.status === 'ACTIVE';
  
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${isOverdue ? '#ef4444' : '#334155'}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '0.5rem' 
          }}>
            {rental.book_title}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            by {rental.book_author}
          </p>
        </div>
        
        <span style={{
          background: rental.status === 'ACTIVE' 
            ? (isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 211, 238, 0.1)')
            : 'rgba(16, 185, 129, 0.1)',
          color: rental.status === 'ACTIVE' 
            ? (isOverdue ? '#ef4444' : '#22D3EE')
            : '#10b981',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          {isOverdue ? 'OVERDUE' : rental.status}
        </span>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        <div>
          <span style={{ color: '#64748B' }}>User:</span>
          <div style={{ color: '#F4F4F4' }}>
            {rental.user_email}
          </div>
        </div>
        
        <div>
          <span style={{ color: '#64748B' }}>Owner:</span>
          <div style={{ color: '#F4F4F4' }}>
            {rental.owner_first_name} {rental.owner_last_name}
          </div>
        </div>
        
        <div>
          <span style={{ color: '#64748B' }}>Rental Date:</span>
          <div style={{ color: '#F4F4F4' }}>
            {new Date(rental.rental_date).toLocaleDateString()}
          </div>
        </div>
        
        <div>
          <span style={{ color: '#64748B' }}>Due Date:</span>
          <div style={{ color: isOverdue ? '#ef4444' : '#F4F4F4' }}>
            {new Date(rental.due_date).toLocaleDateString()}
          </div>
        </div>
        
        <div>
          <span style={{ color: '#64748B' }}>Price:</span>
          <div style={{ color: '#22D3EE', fontWeight: '600' }}>
            ${rental.rental_price}
          </div>
        </div>
        
        {rental.return_date && (
          <div>
            <span style={{ color: '#64748B' }}>Returned:</span>
            <div style={{ color: '#10b981' }}>
              {new Date(rental.return_date).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
      
      {rental.status === 'ACTIVE' && (
        <button
          onClick={() => onUpdateStatus(rental.id, 'RETURNED')}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)',
            color: '#0F172A',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Mark as Returned
        </button>
      )}
    </div>
  );
};

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchRentals();
  }, [filters]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status', filters.status.toUpperCase());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const response = await api.get(`/rentals?${params.toString()}`);
      setRentals(response.data.rentals || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setError('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rentalId, status) => {
    try {
      await api.patch(`/rentals/${rentalId}/return`);
      alert('Rental status updated successfully!');
      fetchRentals();
    } catch (error) {
      console.error('Error updating rental status:', error);
      alert(error.response?.data?.error || 'Failed to update rental status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '2rem' 
          }}>
            Manage Rentals
          </h1>

          {/* Filters */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem',
            background: '#1e293b',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}>
            <input
              type="text"
              placeholder="Search by user email or book title..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: '#0F172A',
                color: '#F4F4F4',
                fontSize: '1rem'
              }}
            />
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: '#0F172A',
                color: '#F4F4F4',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Rentals</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: '#64748B' }}>Loading rentals...</div>
            </div>
          ) : rentals.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ color: '#64748B', fontSize: '1.1rem' }}>
                No rentals found matching your criteria.
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {rentals.map(rental => (
                <RentalCard 
                  key={rental.id} 
                  rental={rental} 
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}