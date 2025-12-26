const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { attachAbility } = require('../middleware/casl');

const router = express.Router();

// Apply authentication and ability to all routes
router.use(authenticateToken);
router.use(attachAbility);

// Get rentals with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      user_id, 
      owner_id,
      book_id,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    
    // Apply role-based filtering
    if (req.user.role === 'USER') {
      whereConditions.push('r.user_id = ?');
      queryParams.push(req.user.id);
    } else if (req.user.role === 'OWNER') {
      whereConditions.push('r.owner_id = ?');
      queryParams.push(req.user.owner_id);
    }
    // Admins can see all rentals (no additional filtering)
    
    // Apply filters
    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }
    
    if (user_id && req.user.role === 'ADMIN') {
      whereConditions.push('r.user_id = ?');
      queryParams.push(user_id);
    }
    
    if (owner_id && req.user.role === 'ADMIN') {
      whereConditions.push('r.owner_id = ?');
      queryParams.push(owner_id);
    }
    
    if (book_id) {
      whereConditions.push('r.book_id = ?');
      queryParams.push(book_id);
    }
    
    if (search) {
      whereConditions.push('(b.title LIKE ? OR b.author LIKE ? OR u.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM rentals r 
      JOIN books b ON r.book_id = b.id 
      JOIN users u ON r.user_id = u.id 
      JOIN owners o ON r.owner_id = o.id 
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get rentals
    const rentalsQuery = `
      SELECT 
        r.*,
        b.title as book_title,
        b.author as book_author,
        b.image_url as book_image,
        u.email as user_email,
        o.first_name as owner_first_name,
        o.last_name as owner_last_name,
        c.name as category_name
      FROM rentals r 
      JOIN books b ON r.book_id = b.id 
      JOIN users u ON r.user_id = u.id 
      JOIN owners o ON r.owner_id = o.id 
      JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rentals] = await pool.execute(rentalsQuery, [...queryParams, parseInt(limit), offset]);
    
    res.json({
      rentals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get rental by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rentals] = await pool.execute(`
      SELECT 
        r.*,
        b.title as book_title,
        b.author as book_author,
        b.image_url as book_image,
        u.email as user_email,
        o.first_name as owner_first_name,
        o.last_name as owner_last_name,
        c.name as category_name
      FROM rentals r 
      JOIN books b ON r.book_id = b.id 
      JOIN users u ON r.user_id = u.id 
      JOIN owners o ON r.owner_id = o.id 
      JOIN categories c ON b.category_id = c.id
      WHERE r.id = ?
    `, [id]);
    
    if (rentals.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    const rental = rentals[0];
    
    // Check permissions
    if (req.user.role === 'USER' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role === 'OWNER' && rental.owner_id !== req.user.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ rental });
    
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create rental (users only)
router.post('/', requireRole(['USER']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { book_id, rental_days = 7 } = req.body;
    
    if (!book_id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    // Get book details with owner info
    const [books] = await connection.execute(`
      SELECT b.*, o.is_approved as owner_approved 
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      WHERE b.id = ?
    `, [book_id]);
    
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = books[0];
    
    // Check if book and owner are approved
    if (!book.is_approved || !book.owner_approved) {
      return res.status(400).json({ error: 'Book is not available for rental' });
    }
    
    // Check availability
    if (book.available_quantity <= 0) {
      return res.status(400).json({ error: 'Book is not available' });
    }
    
    // Check if user already has an active rental for this book
    const [existingRentals] = await connection.execute(
      'SELECT id FROM rentals WHERE user_id = ? AND book_id = ? AND status = "ACTIVE"',
      [req.user.id, book_id]
    );
    
    if (existingRentals.length > 0) {
      return res.status(400).json({ error: 'You already have an active rental for this book' });
    }
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(rental_days));
    
    // Create rental
    const [rentalResult] = await connection.execute(`
      INSERT INTO rentals (user_id, book_id, owner_id, rental_price, due_date) 
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, book_id, book.owner_id, book.rental_price, dueDate]);
    
    // Update book availability
    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?',
      [book_id]
    );
    
    // Update owner wallet
    await connection.execute(
      'UPDATE wallets SET balance = balance + ?, total_earned = total_earned + ? WHERE owner_id = ?',
      [book.rental_price, book.rental_price, book.owner_id]
    );
    
    await connection.commit();
    
    // Get created rental with details
    const [createdRentals] = await pool.execute(`
      SELECT 
        r.*,
        b.title as book_title,
        b.author as book_author,
        o.first_name as owner_first_name,
        o.last_name as owner_last_name
      FROM rentals r 
      JOIN books b ON r.book_id = b.id 
      JOIN owners o ON r.owner_id = o.id 
      WHERE r.id = ?
    `, [rentalResult.insertId]);
    
    res.status(201).json({
      message: 'Book rented successfully',
      rental: createdRentals[0]
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Create rental error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Return book
router.patch('/:id/return', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get rental
    const [rentals] = await connection.execute(`
      SELECT r.*, b.owner_id 
      FROM rentals r 
      JOIN books b ON r.book_id = b.id 
      WHERE r.id = ?
    `, [id]);
    
    if (rentals.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    
    const rental = rentals[0];
    
    // Check permissions
    if (req.user.role === 'USER' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role === 'OWNER' && rental.owner_id !== req.user.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role !== 'ADMIN' && req.user.role !== 'USER' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if already returned
    if (rental.status === 'RETURNED') {
      return res.status(400).json({ error: 'Book already returned' });
    }
    
    // Update rental status
    await connection.execute(
      'UPDATE rentals SET status = "RETURNED", return_date = NOW() WHERE id = ?',
      [id]
    );
    
    // Update book availability
    await connection.execute(
      'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?',
      [rental.book_id]
    );
    
    await connection.commit();
    
    res.json({ message: 'Book returned successfully' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Return book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Get rental statistics
router.get('/stats/overview', async (req, res) => {
  try {
    let statsQuery;
    let queryParams = [];
    
    if (req.user.role === 'ADMIN') {
      // Admin sees all stats
      statsQuery = `
        SELECT 
          COUNT(*) as total_rentals,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_rentals,
          COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returned_rentals,
          COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_rentals,
          COALESCE(SUM(rental_price), 0) as total_revenue,
          COALESCE(AVG(rental_price), 0) as average_rental_price
        FROM rentals
      `;
    } else if (req.user.role === 'OWNER') {
      // Owner sees their stats
      statsQuery = `
        SELECT 
          COUNT(*) as total_rentals,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_rentals,
          COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returned_rentals,
          COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_rentals,
          COALESCE(SUM(rental_price), 0) as total_revenue,
          COALESCE(AVG(rental_price), 0) as average_rental_price
        FROM rentals 
        WHERE owner_id = ?
      `;
      queryParams.push(req.user.owner_id);
    } else {
      // User sees their stats
      statsQuery = `
        SELECT 
          COUNT(*) as total_rentals,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_rentals,
          COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returned_rentals,
          COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue_rentals,
          COALESCE(SUM(rental_price), 0) as total_spent,
          COALESCE(AVG(rental_price), 0) as average_rental_price
        FROM rentals 
        WHERE user_id = ?
      `;
      queryParams.push(req.user.id);
    }
    
    const [stats] = await pool.execute(statsQuery, queryParams);
    
    res.json({ stats: stats[0] });
    
  } catch (error) {
    console.error('Get rental stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update overdue rentals (admin only - typically called by a cron job)
router.patch('/update-overdue', requireRole(['ADMIN']), async (req, res) => {
  try {
    const [result] = await pool.execute(`
      UPDATE rentals 
      SET status = 'OVERDUE' 
      WHERE status = 'ACTIVE' AND due_date < NOW()
    `);
    
    res.json({ 
      message: 'Overdue rentals updated successfully',
      updated_count: result.affectedRows
    });
    
  } catch (error) {
    console.error('Update overdue rentals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;