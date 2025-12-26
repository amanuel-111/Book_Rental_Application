import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const StatCard = ({ title, value, icon, color, change, changeType }) => (
  <div style={{
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #334155',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <div style={{
        fontSize: '2.5rem',
        marginRight: '1rem',
        filter: `hue-rotate(${color}deg)`
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          fontSize: '0.9rem', 
          color: '#64748B',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </h3>
        <div style={{ 
          fontSize: '2.2rem', 
          fontWeight: '700', 
          color: '#22D3EE',
          margin: '0.25rem 0'
        }}>
          {value}
        </div>
        {change && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: changeType === 'positive' ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>{changeType === 'positive' ? '↗' : '↘'}</span>
            {change}% from last month
          </div>
        )}
      </div>
    </div>
  </div>
);

const TopItem = ({ item, type }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#0F172A',
    borderRadius: '8px',
    border: '1px solid #334155',
    marginBottom: '0.5rem'
  }}>
    <div>
      <div style={{ color: '#F4F4F4', fontWeight: '500', marginBottom: '0.25rem' }}>
        {type === 'book' ? item.title : 
         type === 'owner' ? `${item.first_name} ${item.last_name}` :
         type === 'user' ? `${item.first_name} ${item.last_name}` : item.name}
      </div>
      <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
        {type === 'book' ? `by ${item.author}` :
         type === 'owner' ? item.email :
         type === 'user' ? item.email :
         `${item.book_count} books`}
      </div>
    </div>
    <div style={{ 
      color: '#22D3EE', 
      fontWeight: '600',
      fontSize: '1.1rem'
    }}>
      {type === 'book' ? `${item.rental_count} rentals` :
       type === 'owner' ? `$${item.total_revenue}` :
       type === 'user' ? `${item.rental_count} rentals` :
       `${item.book_count} books`}
    </div>
  </div>
);

const ActivityChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #334155'
    }}>
      <h3 style={{ 
        color: '#F4F4F4', 
        marginBottom: '1.5rem',
        fontSize: '1.2rem',
        fontWeight: '600'
      }}>
        Platform Activity (Last 7 Days)
      </h3>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        gap: '0.5rem',
        height: '200px',
        padding: '1rem 0'
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)',
              width: '100%',
              height: `${(item.value / maxValue) * 150}px`,
              borderRadius: '4px 4px 0 0',
              minHeight: '10px',
              transition: 'all 0.3s ease'
            }} />
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#64748B',
              textAlign: 'center'
            }}>
              {item.day}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#22D3EE',
              fontWeight: '600'
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Stats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalBooks: 0,
    totalRentals: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });
  const [activityData, setActivityData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topOwners, setTopOwners] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch platform statistics
      const statsResponse = await api.get('/admin/platform-stats');
      setStats(statsResponse.data);
      
      // Fetch activity data
      const activityResponse = await api.get('/admin/activity-chart');
      setActivityData(activityResponse.data.chartData || []);
      
      // Fetch top performers
      const topBooksResponse = await api.get('/admin/top-books');
      setTopBooks(topBooksResponse.data.books || []);
      
      const topOwnersResponse = await api.get('/admin/top-owners');
      setTopOwners(topOwnersResponse.data.owners || []);
      
      const topUsersResponse = await api.get('/admin/top-users');
      setTopUsers(topUsersResponse.data.users || []);
      
      const topCategoriesResponse = await api.get('/admin/top-categories');
      setTopCategories(topCategoriesResponse.data.categories || []);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
      
      // Mock data for demonstration
      setStats({
        totalUsers: 1247,
        totalOwners: 89,
        totalBooks: 3456,
        totalRentals: 8923,
        totalRevenue: 45678.90,
        pendingApprovals: 23
      });
      
      setActivityData([
        { day: 'Mon', value: 45 },
        { day: 'Tue', value: 52 },
        { day: 'Wed', value: 38 },
        { day: 'Thu', value: 67 },
        { day: 'Fri', value: 73 },
        { day: 'Sat', value: 89 },
        { day: 'Sun', value: 56 }
      ]);
      
      setTopBooks([
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', rental_count: 156 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', rental_count: 134 },
        { id: 3, title: '1984', author: 'George Orwell', rental_count: 128 }
      ]);
      
      setTopOwners([
        { id: 1, first_name: 'John', last_name: 'Smith', email: 'john@example.com', total_revenue: 2450.75 },
        { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@example.com', total_revenue: 1890.50 },
        { id: 3, first_name: 'Mike', last_name: 'Davis', email: 'mike@example.com', total_revenue: 1567.25 }
      ]);
      
      setTopUsers([
        { id: 1, first_name: 'Alice', last_name: 'Brown', email: 'alice@example.com', rental_count: 45 },
        { id: 2, first_name: 'Bob', last_name: 'Wilson', email: 'bob@example.com', rental_count: 38 },
        { id: 3, first_name: 'Carol', last_name: 'Taylor', email: 'carol@example.com', rental_count: 32 }
      ]);
      
      setTopCategories([
        { id: 1, name: 'Fiction', book_count: 456 },
        { id: 2, name: 'Science', book_count: 234 },
        { id: 3, name: 'History', book_count: 189 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardLayout>
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              color: '#F4F4F4',
              margin: 0
            }}>
              Platform Statistics
            </h1>
            
            <button
              onClick={fetchStats}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #22D3EE 0%, #0891b2 100%)',
                color: '#0F172A',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Refresh Data
            </button>
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
              {error} (Showing demo data)
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: '#64748B' }}>Loading statistics...</div>
            </div>
          ) : (
            <>
              {/* Main Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers?.toLocaleString() || '0'}
                  icon="👥"
                  color="0"
                  change="12"
                  changeType="positive"
                />
                
                <StatCard
                  title="Book Owners"
                  value={stats.totalOwners?.toLocaleString() || '0'}
                  icon="👤"
                  color="60"
                  change="8"
                  changeType="positive"
                />
                
                <StatCard
                  title="Total Books"
                  value={stats.totalBooks?.toLocaleString() || '0'}
                  icon="📚"
                  color="120"
                  change="15"
                  changeType="positive"
                />
                
                <StatCard
                  title="Total Rentals"
                  value={stats.totalRentals?.toLocaleString() || '0'}
                  icon="📋"
                  color="180"
                  change="23"
                  changeType="positive"
                />
                
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue?.toLocaleString() || '0'}`}
                  icon="💰"
                  color="240"
                  change="18"
                  changeType="positive"
                />
                
                <StatCard
                  title="Pending Approvals"
                  value={stats.pendingApprovals?.toLocaleString() || '0'}
                  icon="⏳"
                  color="300"
                  change="5"
                  changeType="negative"
                />
              </div>

              {/* Activity Chart */}
              {activityData.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <ActivityChart data={activityData} />
                </div>
              )}

              {/* Top Performers Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '1.5rem'
              }}>
                {/* Top Books */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ 
                    color: '#F4F4F4', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    Most Popular Books
                  </h3>
                  
                  {topBooks.length === 0 ? (
                    <div style={{ color: '#64748B', textAlign: 'center', padding: '1rem' }}>
                      No data available
                    </div>
                  ) : (
                    topBooks.map(book => (
                      <TopItem key={book.id} item={book} type="book" />
                    ))
                  )}
                </div>

                {/* Top Owners */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ 
                    color: '#F4F4F4', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    Top Earning Owners
                  </h3>
                  
                  {topOwners.length === 0 ? (
                    <div style={{ color: '#64748B', textAlign: 'center', padding: '1rem' }}>
                      No data available
                    </div>
                  ) : (
                    topOwners.map(owner => (
                      <TopItem key={owner.id} item={owner} type="owner" />
                    ))
                  )}
                </div>

                {/* Top Users */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ 
                    color: '#F4F4F4', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    Most Active Users
                  </h3>
                  
                  {topUsers.length === 0 ? (
                    <div style={{ color: '#64748B', textAlign: 'center', padding: '1rem' }}>
                      No data available
                    </div>
                  ) : (
                    topUsers.map(user => (
                      <TopItem key={user.id} item={user} type="user" />
                    ))
                  )}
                </div>

                {/* Top Categories */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #334155'
                }}>
                  <h3 style={{ 
                    color: '#F4F4F4', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    Popular Categories
                  </h3>
                  
                  {topCategories.length === 0 ? (
                    <div style={{ color: '#64748B', textAlign: 'center', padding: '1rem' }}>
                      No data available
                    </div>
                  ) : (
                    topCategories.map(category => (
                      <TopItem key={category.id} item={category} type="category" />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}