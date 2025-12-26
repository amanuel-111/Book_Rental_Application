const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { attachAbility } = require('../middleware/casl');

const router = express.Router();

// Apply authentication and ability to all routes
router.use(authenticateToken);
router.use(attachAbility);

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category: categories[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get books by category with stats
router.get('/:id/books', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if category exists
    const [categories] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    let whereConditions = ['b.category_id = ?'];
    let queryParams = [id];
    
    // Apply role-based filtering
    if (req.user.role === 'USER') {
      whereConditions.push('b.is_approved = true AND o.is_approved = true');
    } else if (req.user.role === 'OWNER') {
      whereConditions.push('b.owner_id = ?');
      queryParams.push(req.user.owner_id);
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get books
    const booksQuery = `
      SELECT 
        b.*,
        o.first_name,
        o.last_name,
        o.location
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [books] = await pool.execute(booksQuery, [...queryParams, parseInt(limit), offset]);
    
    res.json({
      category: categories[0],
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get category books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category statistics (admin only)
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can see detailed stats
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [stats] = await pool.execute(`
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT b.id) as total_books,
        COUNT(DISTINCT CASE WHEN b.is_approved = true THEN b.id END) as approved_books,
        COUNT(DISTINCT CASE WHEN b.available_quantity > 0 THEN b.id END) as available_books,
        COUNT(DISTINCT r.id) as total_rentals,
        COALESCE(SUM(r.rental_price), 0) as total_revenue,
        COUNT(DISTINCT b.owner_id) as unique_owners
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      LEFT JOIN rentals r ON b.id = r.book_id
      WHERE c.id = ?
      GROUP BY c.id, c.name
    `, [id]);
    
    if (stats.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ stats: stats[0] });
    
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;