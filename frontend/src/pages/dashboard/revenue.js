import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import api from '../../lib/api';

const RevenueCard = ({ title, value, icon, color, subtitle }) => (
  <div style={{
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #334155',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <div style={{
        fontSize: '2rem',
        marginRight: '1rem',
        filter: `hue-rotate(${color}deg)`
      }}>
        {icon}
      </div>
      <div>
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
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#22D3EE',
          margin: '0.25rem 0'
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.amount));
  
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
        Monthly Revenue Trend
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
              height: `${(item.amount / maxValue) * 150}px`,
              borderRadius: '4px 4px 0 0',
              minHeight: '10px',
              transition: 'all 0.3s ease'
            }} />
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#64748B',
              textAlign: 'center'
            }}>
              {item.month}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#22D3EE',
              fontWeight: '600'
            }}>
              ${item.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentTransaction = ({ transaction }) => (
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
        {transaction.book_title}
      </div>
      <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
        Rented by {transaction.user_name} • {new Date(transaction.rental_date).toLocaleDateString()}
      </div>
    </div>
    <div style={{ 
      color: '#22D3EE', 
      fontWeight: '600',
      fontSize: '1.1rem'
    }}>
      +${transaction.amount}
    </div>
  </div>
);

export default function Revenue() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalRentals: 0,
    averageRental: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('6months');

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch revenue statistics
      const statsResponse = await api.get(`/rentals/revenue-stats?period=${dateRange}`);
      setStats(statsResponse.data);
      
      // Fetch chart data
      const chartResponse = await api.get(`/rentals/revenue-chart?period=${dateRange}`);
      setChartData(chartResponse.data.chartData || []);
      
      // Fetch recent transactions
      const transactionsResponse = await api.get('/rentals/recent-transactions?limit=10');
      setRecentTransactions(transactionsResponse.data.transactions || []);
      
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setError('Failed to load revenue data');
      
      // Mock data for demonstration
      setStats({
        totalRevenue: 2450.75,
        monthlyRevenue: 485.20,
        totalRentals: 127,
        averageRental: 19.30
      });
      
      setChartData([
        { month: 'Jul', amount: 320 },
        { month: 'Aug', amount: 450 },
        { month: 'Sep', amount: 380 },
        { month: 'Oct', amount: 520 },
        { month: 'Nov', amount: 485 },
        { month: 'Dec', amount: 295 }
      ]);
      
      setRecentTransactions([
        {
          id: 1,
          book_title: 'The Great Gatsby',
          user_name: 'John Doe',
          rental_date: '2024-12-20',
          amount: 15.99
        },
        {
          id: 2,
          book_title: 'To Kill a Mockingbird',
          user_name: 'Jane Smith',
          rental_date: '2024-12-19',
          amount: 12.50
        },
        {
          id: 3,
          book_title: '1984',
          user_name: 'Bob Johnson',
          rental_date: '2024-12-18',
          amount: 18.75
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['OWNER']}>
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
              Revenue Dashboard
            </h1>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #334155',
                borderRadius: '6px',
                background: '#1e293b',
                color: '#F4F4F4',
                fontSize: '1rem'
              }}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
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
              {error} (Showing demo data)
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ color: '#64748B' }}>Loading revenue data...</div>
            </div>
          ) : (
            <>
              {/* Revenue Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <RevenueCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue?.toFixed(2) || '0.00'}`}
                  icon="💰"
                  color="120"
                  subtitle="All time earnings"
                />
                
                <RevenueCard
                  title="This Month"
                  value={`$${stats.monthlyRevenue?.toFixed(2) || '0.00'}`}
                  icon="📈"
                  color="180"
                  subtitle="Current month revenue"
                />
                
                <RevenueCard
                  title="Total Rentals"
                  value={stats.totalRentals || 0}
                  icon="📚"
                  color="240"
                  subtitle="Books rented"
                />
                
                <RevenueCard
                  title="Avg per Rental"
                  value={`$${stats.averageRental?.toFixed(2) || '0.00'}`}
                  icon="💵"
                  color="300"
                  subtitle="Average rental price"
                />
              </div>

              {/* Revenue Chart */}
              {chartData.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <RevenueChart data={chartData} />
                </div>
              )}

              {/* Recent Transactions */}
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
                  Recent Transactions
                </h3>
                
                {recentTransactions.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    color: '#64748B'
                  }}>
                    No recent transactions found
                  </div>
                ) : (
                  <div>
                    {recentTransactions.map(transaction => (
                      <RecentTransaction 
                        key={transaction.id} 
                        transaction={transaction} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}