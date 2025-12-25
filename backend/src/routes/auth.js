const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { email, password, role, firstName, lastName, phone, address, location } = req.body;
    
    // Check if user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userResult = await client.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role]
    );
    
    const user = userResult.rows[0];
    let ownerData = null;
    
    // If registering as owner, create owner record
    if (role === 'OWNER') {
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required for owners' });
      }
      
      const ownerResult = await client.query(
        'INSERT INTO owners (user_id, first_name, last_name, phone, address, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user.id, firstName, lastName, phone || null, address || null, location || null]
      );
      
      // Create wallet for owner
      await client.query(
        'INSERT INTO wallets (owner_id) VALUES ($1)',
        [ownerResult.rows[0].id]
      );
      
      ownerData = { id: ownerResult.rows[0].id, is_approved: false };
    }
    
    await client.query('COMMIT');
    
    const token = generateToken(user.id, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        owner: ownerData
      },
      token
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user with owner data
    const result = await pool.query(`
      SELECT u.*, o.id as owner_id, o.is_approved as owner_approved,
             o.first_name, o.last_name, o.location
      FROM users u 
      LEFT JOIN owners o ON u.id = o.user_id 
      WHERE u.email = $1 AND u.is_active = true
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.role);
    
    // Remove password from response
    delete user.password;
    
    res.json({
      message: 'Login successful',
      user,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;