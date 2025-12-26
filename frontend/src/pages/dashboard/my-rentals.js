import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const RentalCard = ({ rental, onReturn, userRole }) => {
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
      
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          background: 'rgba(34, 211, 238, 0.1)',
          color: '#22D3EE',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.8rem'
        }}>
          {rental.category_name}
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
      
      {userRole === 'OWNER' && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Rented by: {rental.user_email}
          </span>
        </div>
      )}
      
      {userRole === 'USER' && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Owner: {rental.owner_first_name} {rental.owner_last_name}
          </span>
        </div>
      )}
      
      {rental.status === 'ACTIVE' && (
        <button
          onClick={() => onReturn(rental.id)}
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
          Return Book
        </button>
      )}
    </div>
  );
};

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchRentals();
  }, [filter]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
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

  const handleReturnBook = async (rentalId) => {
    try {
      await api.patch(`/rentals/${rentalId}/return`);
      alert('Book returned successfully!');
      fetchRentals(); // Refresh the list
    } catch (error) {
      console.error('Error returning book:', error);
      alert(error.response?.data?.error || 'Failed to return book');
    }
  };

  const filteredRentals = rentals.filter(rental => {
    if (filter === 'all') return true;
    if (filter === 'active') return rental.status === 'ACTIVE';
    if (filter === 'returned') return rental.status === 'RETURNED';
    if (filter === 'overdue') {
      return rental.status === 'ACTIVE' && new Date(rental.due_date) < new Date();
    }
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['USER', 'OWNER']}>
      <DashboardLayout>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '2rem' 
          }}>
            My Rentals
          </h1>

          {/* Filter Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All Rentals' },
              { key: 'active', label: 'Active' },
              { key: 'returned', label: 'Returned' },
              { key: 'overdue', label: 'Overdue' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: filter === tab.key 
                    ? 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)'
                    : 'transparent',
                  color: filter === tab.key ? '#0F172A' : '#64748B',
                  border: `1px solid ${filter === tab.key ? '#22D3EE' : '#334155'}`,
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
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
          ) : filteredRentals.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ color: '#64748B', fontSize: '1.1rem' }}>
                No rentals found for the selected filter.
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {filteredRentals.map(rental => (
                <RentalCard 
                  key={rental.id} 
                  rental={rental} 
                  onReturn={handleReturnBook}
                  userRole={user?.role}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}