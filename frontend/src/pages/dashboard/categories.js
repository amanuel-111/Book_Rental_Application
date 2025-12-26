import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const CategoryCard = ({ category, onViewBooks }) => (
  <div style={{
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #334155',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 12px 25px rgba(34, 211, 238, 0.2)';
    e.currentTarget.style.borderColor = '#22D3EE';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = '#334155';
  }}
  >
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        color: '#F4F4F4',
        marginBottom: '0.5rem' 
      }}>
        {category.name}
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {category.description}
      </p>
    </div>
    
    <button
      onClick={() => onViewBooks(category)}
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
      View Books
    </button>
  </div>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooks = (category) => {
    // Navigate to books page with category filter
    window.location.href = `/books?category=${category.id}`;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '1rem' 
          }}>
            Book Categories
          </h1>
          
          <p style={{ 
            color: '#64748B', 
            fontSize: '1.1rem',
            marginBottom: '2rem' 
          }}>
            Explore books by category and discover your next great read.
          </p>

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
              <div style={{ color: '#64748B' }}>Loading categories...</div>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
              <div style={{ color: '#64748B', fontSize: '1.1rem' }}>
                No categories found.
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {categories.map(category => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onViewBooks={handleViewBooks}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}