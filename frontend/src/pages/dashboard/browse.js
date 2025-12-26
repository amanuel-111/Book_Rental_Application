import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const BookCard = ({ book, onRent }) => (
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
        fontSize: '1.2rem', 
        fontWeight: '600', 
        color: '#F4F4F4',
        marginBottom: '0.5rem' 
      }}>
        {book.title}
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
        by {book.author}
      </p>
    </div>
    
    <div style={{ marginBottom: '1rem' }}>
      <span style={{
        background: 'rgba(34, 211, 238, 0.1)',
        color: '#22D3EE',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem'
      }}>
        {book.category_name}
      </span>
    </div>
    
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1rem'
    }}>
      <span style={{ color: '#64748B', fontSize: '0.9rem' }}>
        Available: {book.available_quantity}
      </span>
      <span style={{ 
        color: '#22D3EE', 
        fontSize: '1.1rem', 
        fontWeight: '600' 
      }}>
        ${book.rental_price}
      </span>
    </div>
    
    <button
      onClick={() => onRent(book)}
      disabled={book.available_quantity === 0}
      style={{
        width: '100%',
        padding: '0.75rem',
        background: book.available_quantity > 0 
          ? 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)' 
          : '#64748B',
        color: book.available_quantity > 0 ? '#0F172A' : '#F4F4F4',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: book.available_quantity > 0 ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease'
      }}
    >
      {book.available_quantity > 0 ? 'Rent Book' : 'Not Available'}
    </button>
  </div>
);

export default function Browse() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    author: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.author) params.append('author', filters.author);
      params.append('approved_only', 'true');
      
      const response = await api.get(`/books?${params.toString()}`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleRentBook = async (book) => {
    try {
      await api.post('/rentals', {
        book_id: book.id,
        rental_days: 7
      });
      
      alert('Book rented successfully!');
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error renting book:', error);
      alert(error.response?.data?.error || 'Failed to rent book');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['USER']}>
      <DashboardLayout>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600', 
            color: '#F4F4F4',
            marginBottom: '2rem' 
          }}>
            Browse Books
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
              placeholder="Search books..."
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
            
            <input
              type="text"
              placeholder="Search by author..."
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
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
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: '#0F172A',
                color: '#F4F4F4',
                fontSize: '1rem'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
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
              <div style={{ color: '#64748B' }}>Loading books...</div>
            </div>
          ) : books.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <div style={{ color: '#64748B', fontSize: '1.1rem' }}>
                No books found matching your criteria.
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onRent={handleRentBook}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}