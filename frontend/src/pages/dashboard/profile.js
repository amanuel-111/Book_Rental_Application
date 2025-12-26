import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile based on role
      if (user.role === 'OWNER' && user.owner_id) {
        await api.put(`/owners/${user.owner_id}`, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          location: formData.location
        });
      }

      setSuccess('Profile updated successfully!');
      
      // Update user context with new data
      const updatedUser = {
        ...user,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        location: formData.location
      };
      updateUser(updatedUser);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '2rem' 
          }}>
            Profile Settings
          </h1>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#F4F4F4',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  background: '#0F172A',
                  color: '#64748B',
                  fontSize: '1rem'
                }}
              />
              <small style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Email cannot be changed
              </small>
            </div>

            {user?.role === 'OWNER' && (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#F4F4F4',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        background: '#0F172A',
                        color: '#F4F4F4',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#F4F4F4',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        background: '#0F172A',
                        color: '#F4F4F4',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#F4F4F4',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      background: '#0F172A',
                      color: '#F4F4F4',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#F4F4F4',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      background: '#0F172A',
                      color: '#F4F4F4',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#F4F4F4',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Full address"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      background: '#0F172A',
                      color: '#F4F4F4',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}

            <div style={{
              background: '#0F172A',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{ color: '#F4F4F4', marginBottom: '0.5rem' }}>
                Account Information
              </h3>
              <p style={{ color: '#64748B', margin: '0.25rem 0' }}>
                <strong>Role:</strong> {user?.role}
              </p>
              {user?.role === 'OWNER' && (
                <p style={{ color: '#64748B', margin: '0.25rem 0' }}>
                  <strong>Status:</strong> {user?.owner_approved ? 'Approved' : 'Pending Approval'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#64748B' : 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)',
                color: loading ? '#F4F4F4' : '#0F172A',
                border: 'none',
                padding: '0.875rem 2rem',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}