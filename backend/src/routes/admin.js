const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { attachAbility } = require('../middleware/casl');

const router = express.Router();

// Apply authentication and ability to all routes
router.use(authenticateToken);
router.use(attachAbility);
router.use(requireRole(['ADMIN'])); // All routes require admin role

// Get platform statistics
router.get('/platform-stats', async (req, res) => {
  try {
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN role = 'USER' THEN 1 END) as regularUsers,
        COUNT(CASE WHEN role = 'OWNER' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins
      FROM users
    `);
    
    const [ownerStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalOwners,
        COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approvedOwners,
        COUNT(CASE WHEN is_approved = 0 THEN 1 END) as pendingOwners
      FROM owners
    `);
    
    const [bookStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalBooks,
        COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approvedBooks,
        COUNT(CASE WHEN is_approved = 0 THEN 1 END) as pendingBooks,
        SUM(total_quantity) as totalCopies,
        SUM(available_quantity) as availableCopies
      FROM books
    `);
    
    const [rentalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalRentals,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as activeRentals,
        COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returnedRentals,
        COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdueRentals,
        COALESCE(SUM(rental_price), 0) as totalRevenue,
        COALESCE(AVG(rental_price), 0) as averageRental
      FROM rentals
    `);
    
    const stats = {
      totalUsers: userStats[0].totalUsers,
      totalOwners: ownerStats[0].totalOwners,
      totalBooks: bookStats[0].totalBooks,
      totalRentals: rentalStats[0].totalRentals,
      totalRevenue: rentalStats[0].totalRevenue,
      pendingApprovals: bookStats[0].pendingBooks + ownerStats[0].pendingOwners,
      activeRentals: rentalStats[0].activeRentals,
      overdueRentals: rentalStats[0].overdueRentals
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity chart data
router.get('/activity-chart', async (req, res) => {
  try {
    const [chartData] = await pool.execute(`
      SELECT 
        DAYNAME(created_at) as day,
        COUNT(*) as value
      FROM rentals 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at), DAYNAME(created_at)
      ORDER BY DATE(created_at)
    `);
    
    // Fill in missing days with 0 values
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const filledData = daysOfWeek.map(day => {
      const found = chartData.find(item => item.day === day);
      return {
        day: day.substring(0, 3), // Mon, Tue, etc.
        value: found ? found.value : 0
      };
    });
    
    res.json({ chartData: filledData });
    
  } catch (error) {
    console.error('Get activity chart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top books
router.get('/top-books', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [books] = await pool.execute(`
      SELECT 
        b.id,
        b.title,
        b.author,
        COUNT(r.id) as rental_count
      FROM books b
      LEFT JOIN rentals r ON b.id = r.book_id
      WHERE b.is_approved = 1
      GROUP BY b.id, b.title, b.author
      ORDER BY rental_count DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ books });
    
  } catch (error) {
    console.error('Get top books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top owners
router.get('/top-owners', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [owners] = await pool.execute(`
      SELECT 
        o.id,
        o.first_name,
        o.last_name,
        o.email,
        COALESCE(SUM(r.rental_price), 0) as total_revenue,
        COUNT(r.id) as total_rentals
      FROM owners o
      LEFT JOIN rentals r ON o.id = r.owner_id
      WHERE o.is_approved = 1
      GROUP BY o.id, o.first_name, o.last_name, o.email
      ORDER BY total_revenue DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ owners });
    
  } catch (error) {
    console.error('Get top owners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top users
router.get('/top-users', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [users] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(r.id) as rental_count,
        COALESCE(SUM(r.rental_price), 0) as total_spent
      FROM users u
      LEFT JOIN rentals r ON u.id = r.user_id
      WHERE u.role = 'USER'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY rental_count DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ users });
    
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top categories
router.get('/top-categories', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [categories] = await pool.execute(`
      SELECT 
        c.id,
        c.name,
        COUNT(b.id) as book_count,
        COUNT(r.id) as rental_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id AND b.is_approved = 1
      LEFT JOIN rentals r ON b.id = r.book_id
      GROUP BY c.id, c.name
      ORDER BY book_count DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ categories });
    
  } catch (error) {
    console.error('Get top categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const [activities] = await pool.execute(`
      SELECT 
        'rental' as type,
        r.id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        b.title as book_title,
        r.created_at as timestamp,
        'rented' as action
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      
      UNION ALL
      
      SELECT 
        'return' as type,
        r.id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        b.title as book_title,
        r.return_date as timestamp,
        'returned' as action
      FROM rentals r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      WHERE r.return_date IS NOT NULL
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json({ activities });
    
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;