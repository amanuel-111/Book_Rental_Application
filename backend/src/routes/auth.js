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
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { email, password, role, firstName, lastName, phone, address, location } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    const userId = userResult.insertId;
    const user = { id: userId, email, role };
    let ownerData = null;
    
    // If registering as owner, create owner record
    if (role === 'OWNER') {
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required for owners' });
      }
      
      const [ownerResult] = await connection.execute(
        'INSERT INTO owners (user_id, first_name, last_name, phone, address, location) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, firstName, lastName, phone || null, address || null, location || null]
      );
      
      const ownerId = ownerResult.insertId;
      
      // Create wallet for owner
      await connection.execute(
        'INSERT INTO wallets (owner_id) VALUES (?)',
        [ownerId]
      );
      
      ownerData = { id: ownerId, is_approved: false };
    }
    
    await connection.commit();
    
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
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user with owner data
    const [users] = await pool.execute(`
      SELECT u.*, o.id as owner_id, o.is_approved as owner_approved,
             o.first_name, o.last_name, o.location
      FROM users u 
      LEFT JOIN owners o ON u.id = o.user_id 
      WHERE u.email = ? AND u.is_active = true
    `, [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
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