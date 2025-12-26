const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole, requireApprovedOwner } = require('../middleware/auth');
const { attachAbility, checkPermission } = require('../middleware/casl');

const router = express.Router();

// Apply authentication and ability to all routes
router.use(authenticateToken);
router.use(attachAbility);

// Get books with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      author, 
      owner, 
      location, 
      search,
      approved_only = 'true'
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    
    // Base query with joins
    let baseQuery = `
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      JOIN users u ON o.user_id = u.id 
      JOIN categories c ON b.category_id = c.id
    `;
    
    // Apply role-based filtering
    if (req.user.role === 'USER') {
      // Users can only see approved books from approved owners
      whereConditions.push('b.is_approved = true AND o.is_approved = true');
    } else if (req.user.role === 'OWNER') {
      // Owners can only see their own books
      whereConditions.push('b.owner_id = ?');
      queryParams.push(req.user.owner_id);
    }
    // Admins can see all books (no additional filtering)
    
    // Apply filters
    if (category) {
      whereConditions.push('b.category_id = ?');
      queryParams.push(category);
    }
    
    if (author) {
      whereConditions.push('b.author LIKE ?');
      queryParams.push(`%${author}%`);
    }
    
    if (owner && req.user.role === 'ADMIN') {
      whereConditions.push('o.id = ?');
      queryParams.push(owner);
    }
    
    if (location && req.user.role === 'ADMIN') {
      whereConditions.push('o.location LIKE ?');
      queryParams.push(`%${location}%`);
    }
    
    if (search) {
      whereConditions.push('(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (approved_only === 'false' && req.user.role === 'ADMIN') {
      // Admin can choose to see unapproved books
    } else if (req.user.role !== 'OWNER') {
      // For non-owners, only show approved books by default
      if (!whereConditions.some(condition => condition.includes('b.is_approved'))) {
        whereConditions.push('b.is_approved = true');
      }
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get books
    const booksQuery = `
      SELECT 
        b.*,
        o.first_name,
        o.last_name,
        o.location,
        o.is_approved as owner_approved,
        c.name as category_name,
        u.email as owner_email
      ${baseQuery}
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [books] = await pool.execute(booksQuery, [...queryParams, parseInt(limit), offset]);
    
    res.json({
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [books] = await pool.execute(`
      SELECT 
        b.*,
        o.first_name,
        o.last_name,
        o.location,
        o.is_approved as owner_approved,
        c.name as category_name,
        u.email as owner_email
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      JOIN users u ON o.user_id = u.id 
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [id]);
    
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = books[0];
    
    // Check permissions
    if (req.user.role === 'USER') {
      if (!book.is_approved || !book.owner_approved) {
        return res.status(403).json({ error: 'Book not available' });
      }
    } else if (req.user.role === 'OWNER') {
      if (book.owner_id !== req.user.owner_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json({ book });
    
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create book (owners only)
router.post('/', requireRole(['OWNER']), requireApprovedOwner, async (req, res) => {
  try {
    const {
      title,
      author,
      category_id,
      isbn,
      description,
      rental_price,
      total_quantity = 1,
      image_url
    } = req.body;
    
    // Validate required fields
    if (!title || !author || !category_id || !rental_price) {
      return res.status(400).json({ 
        error: 'Title, author, category, and rental price are required' 
      });
    }
    
    // Validate category exists
    const [categories] = await pool.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO books (
        owner_id, title, author, category_id, isbn, description, 
        rental_price, total_quantity, available_quantity, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.owner_id, title, author, category_id, isbn, description,
      rental_price, total_quantity, total_quantity, image_url
    ]);
    
    // Get the created book
    const [books] = await pool.execute(`
      SELECT 
        b.*,
        o.first_name,
        o.last_name,
        c.name as category_name
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Book created successfully',
      book: books[0]
    });
    
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update book
router.put('/:id', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      category_id,
      isbn,
      description,
      rental_price,
      total_quantity,
      available_quantity,
      image_url,
      is_approved
    } = req.body;
    
    // Get existing book
    const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [id]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = books[0];
    
    // Check permissions
    if (req.user.role === 'OWNER' && book.owner_id !== req.user.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Prepare update fields
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (author !== undefined) {
      updateFields.push('author = ?');
      updateValues.push(author);
    }
    if (category_id !== undefined) {
      // Validate category exists
      const [categories] = await pool.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    if (isbn !== undefined) {
      updateFields.push('isbn = ?');
      updateValues.push(isbn);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (rental_price !== undefined) {
      updateFields.push('rental_price = ?');
      updateValues.push(rental_price);
    }
    if (total_quantity !== undefined) {
      updateFields.push('total_quantity = ?');
      updateValues.push(total_quantity);
    }
    if (available_quantity !== undefined) {
      updateFields.push('available_quantity = ?');
      updateValues.push(available_quantity);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
    }
    
    // Only admins can approve books
    if (is_approved !== undefined && req.user.role === 'ADMIN') {
      updateFields.push('is_approved = ?');
      updateValues.push(is_approved);
      if (is_approved) {
        updateFields.push('approved_by = ?', 'approved_at = NOW()');
        updateValues.push(req.user.id);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id);
    
    await pool.execute(`
      UPDATE books SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);
    
    // Get updated book
    const [updatedBooks] = await pool.execute(`
      SELECT 
        b.*,
        o.first_name,
        o.last_name,
        c.name as category_name
      FROM books b 
      JOIN owners o ON b.owner_id = o.id 
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [id]);
    
    res.json({
      message: 'Book updated successfully',
      book: updatedBooks[0]
    });
    
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete book
router.delete('/:id', requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing book
    const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [id]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = books[0];
    
    // Check permissions
    if (req.user.role === 'OWNER' && book.owner_id !== req.user.owner_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if book has active rentals
    const [activeRentals] = await pool.execute(
      'SELECT COUNT(*) as count FROM rentals WHERE book_id = ? AND status = "ACTIVE"',
      [id]
    );
    
    if (activeRentals[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete book with active rentals' 
      });
    }
    
    await pool.execute('DELETE FROM books WHERE id = ?', [id]);
    
    res.json({ message: 'Book deleted successfully' });
    
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;