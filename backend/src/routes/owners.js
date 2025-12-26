const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { attachAbility } = require('../middleware/casl');

const router = express.Router();

// Apply authentication and ability to all routes
router.use(authenticateToken);
router.use(attachAbility);

// Get owners (admin only)
router.get('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      approved,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    
    // Apply filters
    if (location) {
      whereConditions.push('o.location LIKE ?');
      queryParams.push(`%${location}%`);
    }
    
    if (approved !== undefined) {
      whereConditions.push('o.is_approved = ?');
      queryParams.push(approved === 'true');
    }
    
    if (search) {
      whereConditions.push('(o.first_name LIKE ? OR o.last_name LIKE ? OR u.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM owners o 
      JOIN users u ON o.user_id = u.id 
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get owners with stats
    const ownersQuery = `
      SELECT 
        o.*,
        u.email,
        u.is_active,
        w.balance,
        w.total_earned,
        COUNT(DISTINCT b.id) as total_books,
        COUNT(DISTINCT CASE WHEN b.is_approved = true THEN b.id END) as approved_books,
        COUNT(DISTINCT r.id) as total_rentals,
        approver.email as approved_by_email
      FROM owners o 
      JOIN users u ON o.user_id = u.id 
      LEFT JOIN wallets w ON o.id = w.owner_id
      LEFT JOIN books b ON o.id = b.owner_id
      LEFT JOIN rentals r ON o.id = r.owner_id
      LEFT JOIN users approver ON o.approved_by = approver.id
      ${whereClause}
      GROUP BY o.id, o.user_id, o.first_name, o.last_name, o.phone, o.address, 
               o.location, o.is_approved, o.approved_by, o.approved_at, o.created_at, 
               o.updated_at, u.email, u.is_active, w.balance, w.total_earned, 
               approver.email
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [owners] = await pool.execute(ownersQuery, [...queryParams, parseInt(limit), offset]);
    
    res.json({
      owners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get owner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (req.user.role === 'OWNER' && req.user.owner_id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role === 'USER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [owners] = await pool.execute(`
      SELECT 
        o.*,
        u.email,
        u.is_active,
        w.balance,
        w.total_earned,
        COUNT(DISTINCT b.id) as total_books,
        COUNT(DISTINCT CASE WHEN b.is_approved = true THEN b.id END) as approved_books,
        COUNT(DISTINCT r.id) as total_rentals,
        approver.email as approved_by_email
      FROM owners o 
      JOIN users u ON o.user_id = u.id 
      LEFT JOIN wallets w ON o.id = w.owner_id
      LEFT JOIN books b ON o.id = b.owner_id
      LEFT JOIN rentals r ON o.id = r.owner_id
      LEFT JOIN users approver ON o.approved_by = approver.id
      WHERE o.id = ?
      GROUP BY o.id, o.user_id, o.first_name, o.last_name, o.phone, o.address, 
               o.location, o.is_approved, o.approved_by, o.approved_at, o.created_at, 
               o.updated_at, u.email, u.is_active, w.balance, w.total_earned, 
               approver.email
    `, [id]);
    
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    res.json({ owner: owners[0] });
    
  } catch (error) {
    console.error('Get owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update owner
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      address,
      location,
      is_approved
    } = req.body;
    
    // Check permissions
    if (req.user.role === 'OWNER' && req.user.owner_id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (req.user.role === 'USER') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get existing owner
    const [owners] = await pool.execute('SELECT * FROM owners WHERE id = ?', [id]);
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    // Prepare update fields
    const updateFields = [];
    const updateValues = [];
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    
    // Only admins can approve owners
    if (is_approved !== undefined && req.user.role === 'ADMIN') {
      updateFields.push('is_approved = ?');
      updateValues.push(is_approved);
      if (is_approved) {
        updateFields.push('approved_by = ?', 'approved_at = NOW()');
        updateValues.push(req.user.id);
      } else {
        updateFields.push('approved_by = NULL', 'approved_at = NULL');
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id);
    
    await pool.execute(`
      UPDATE owners SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);
    
    // Get updated owner
    const [updatedOwners] = await pool.execute(`
      SELECT 
        o.*,
        u.email,
        u.is_active,
        w.balance,
        w.total_earned
      FROM owners o 
      JOIN users u ON o.user_id = u.id 
      LEFT JOIN wallets w ON o.id = w.owner_id
      WHERE o.id = ?
    `, [id]);
    
    res.json({
      message: 'Owner updated successfully',
      owner: updatedOwners[0]
    });
    
  } catch (error) {
    console.error('Update owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable owner (admin only)
router.patch('/:id/disable', requireRole(['ADMIN']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get owner
    const [owners] = await connection.execute('SELECT * FROM owners WHERE id = ?', [id]);
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    const owner = owners[0];
    
    // Disable the user account
    await connection.execute('UPDATE users SET is_active = false WHERE id = ?', [owner.user_id]);
    
    // Update all owner's books to unavailable
    await connection.execute('UPDATE books SET available_quantity = 0 WHERE owner_id = ?', [id]);
    
    await connection.commit();
    
    res.json({ message: 'Owner disabled successfully' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Disable owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Enable owner (admin only)
router.patch('/:id/enable', requireRole(['ADMIN']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Get owner
    const [owners] = await connection.execute('SELECT * FROM owners WHERE id = ?', [id]);
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    const owner = owners[0];
    
    // Enable the user account
    await connection.execute('UPDATE users SET is_active = true WHERE id = ?', [owner.user_id]);
    
    // Restore book quantities (set available = total for approved books)
    await connection.execute(`
      UPDATE books 
      SET available_quantity = total_quantity 
      WHERE owner_id = ? AND is_approved = true
    `, [id]);
    
    await connection.commit();
    
    res.json({ message: 'Owner enabled successfully' });
    
  } catch (error) {
    await connection.rollback();
    console.error('Enable owner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Get owner statistics (admin only)
router.get('/:id/stats', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT b.id) as total_books,
        COUNT(DISTINCT CASE WHEN b.is_approved = true THEN b.id END) as approved_books,
        COUNT(DISTINCT r.id) as total_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'ACTIVE' THEN r.id END) as active_rentals,
        COALESCE(SUM(r.rental_price), 0) as total_revenue,
        w.balance as current_balance
      FROM owners o
      LEFT JOIN books b ON o.id = b.owner_id
      LEFT JOIN rentals r ON o.id = r.owner_id
      LEFT JOIN wallets w ON o.id = w.owner_id
      WHERE o.id = ?
      GROUP BY o.id, w.balance
    `, [id]);
    
    if (stats.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    res.json({ stats: stats[0] });
    
  } catch (error) {
    console.error('Get owner stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;