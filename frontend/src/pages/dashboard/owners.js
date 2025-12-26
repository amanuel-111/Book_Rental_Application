import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const OwnerCard = ({ owner, onApprove, onDisable }) => (
  <div style={{
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #334155',
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
          {owner.first_name} {owner.last_name}
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          {owner.email}
        </p>
      </div>
      
      <span style={{
        background: owner.is_approved 
          ? 'rgba(16, 185, 129, 0.1)'
          : 'rgba(239, 68, 68, 0.1)',
        color: owner.is_approved ? '#10b981' : '#ef4444',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500'
      }}>
        {owner.is_approved ? 'APPROVED' : 'PENDING'}
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
        <span style={{ color: '#64748B' }}>Location:</span>
        <div style={{ color: '#F4F4F4' }}>
          {owner.location || 'Not specified'}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Phone:</span>
        <div style={{ color: '#F4F4F4' }}>
          {owner.phone || 'Not specified'}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Total Books:</span>
        <div style={{ color: '#22D3EE', fontWeight: '600' }}>
          {owner.total_books || 0}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Total Rentals:</span>
        <div style={{ color: '#22D3EE', fontWeight: '600' }}>
          {owner.total_rentals || 0}
        </div>
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem',
      flexWrap: 'wrap'
    }}>
      {!owner.is_approved && (
        <button
          onClick={() => onApprove(owner.id)}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#F4F4F4',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Approve
        </button>
      )}
      
      <button
        onClick={() => onDisable(owner.id)}
        style={{
          flex: 1,
          padding: '0.75rem',
          background: owner.is_active 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)',
          color: owner.is_active ? '#F4F4F4' : '#0F172A',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {owner.is_active ? 'Disable' : 'Enable'}
      </button>
    </div>
  </div>
);

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOwners();
  }, [filter]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('approved', filter === 'approved' ? 'true' : 'false');
      }
      
      const response = await api.get(`/owners?${params.toString()}`);
      setOwners(response.data.owners || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setError('Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ownerId) => {
    try {
      await api.put(`/owners/${ownerId}`, { is_approved: true });
      alert('Owner approved successfully!');
      fetchOwners();
    } catch (error) {
      console.error('Error approving owner:', error);
      alert(error.response?.data?.error || 'Failed to approve owner');
    }
  };

  const handleDisable = async (ownerId) => {
    try {
      const owner = owners.find(o => o.id === ownerId);
      if (owner?.is_active) {
        await api.patch(`/owners/${ownerId}/disable`);
        alert('Owner disabled successfully!');
      } else {
        await api.patch(`/owners/${ownerId}/enable`);
        alert('Owner enabled successfully!');
      }
      fetchOwners();
    } catch (error) {
      console.error('Error updating owner status:', error);
      alert(error.response?.data?.error || 'Failed to update owner status');
    }
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
            Manage Owners
          </h1>

          {/* Filter Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All Owners' },
              { key: 'pending', label: 'Pending Approval' },
              { key: 'approved', label: 'Approved' }
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
              <div style={{ color: '#64748B' }}>Loading owners...</div>
            </div>
          ) : owners.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <div style={{ color: '#64748B', fontSize: '1.1rem' }}>
                No owners found for the selected filter.
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {owners.map(owner => (
                <OwnerCard 
                  key={owner.id} 
                  owner={owner} 
                  onApprove={handleApprove}
                  onDisable={handleDisable}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}