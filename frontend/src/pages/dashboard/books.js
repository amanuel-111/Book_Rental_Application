import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const BookCard = ({ book, onApprove, onDelete }) => (
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
          {book.title}
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          by {book.author}
        </p>
      </div>
      
      <span style={{
        background: book.is_approved 
          ? 'rgba(16, 185, 129, 0.1)'
          : 'rgba(239, 68, 68, 0.1)',
        color: book.is_approved ? '#10b981' : '#ef4444',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500'
      }}>
        {book.is_approved ? 'APPROVED' : 'PENDING'}
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
        {book.category_name}
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
        <span style={{ color: '#64748B' }}>Owner:</span>
        <div style={{ color: '#F4F4F4' }}>
          {book.first_name} {book.last_name}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Location:</span>
        <div style={{ color: '#F4F4F4' }}>
          {book.location || 'Not specified'}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Price:</span>
        <div style={{ color: '#22D3EE', fontWeight: '600' }}>
          ${book.rental_price}
        </div>
      </div>
      
      <div>
        <span style={{ color: '#64748B' }}>Available:</span>
        <div style={{ color: '#22D3EE', fontWeight: '600' }}>
          {book.available_quantity}/{book.total_quantity}
        </div>
      </div>
    </div>
    
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem',
      flexWrap: 'wrap'
    }}>
      {!book.is_approved && (
        <button
          onClick={() => onApprove(book.id)}
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
        onClick={() => onDelete(book.id)}
        style={{
          flex: 1,
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#F4F4F4',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Delete
      </button>
    </div>
  </div>
);

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    approved: 'all'
  });

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
      if (filters.approved !== 'all') {
        params.append('approved_only', filters.approved === 'approved' ? 'true' : 'false');
      }
      
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

  const handleApprove = async (bookId) => {
    try {
      await api.put(`/books/${bookId}`, { is_approved: true });
      alert('Book approved successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Error approving book:', error);
      alert(error.response?.data?.error || 'Failed to approve book');
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await api.delete(`/books/${bookId}`);
      alert('Book deleted successfully!');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error.response?.data?.error || 'Failed to delete book');
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
            Manage Books
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
            
            <select
              value={filters.approved}
              onChange={(e) => handleFilterChange('approved', e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: '#0F172A',
                color: '#F4F4F4',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Books</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Approval</option>
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}