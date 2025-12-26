const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with owner data
    const [users] = await pool.execute(`
      SELECT u.*, o.id as owner_id, o.is_approved as owner_approved,
             o.first_name, o.last_name, o.location
      FROM users u 
      LEFT JOIN owners o ON u.id = o.user_id 
      WHERE u.id = ? AND u.is_active = true
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireApprovedOwner = (req, res, next) => {
  if (req.user.role === 'OWNER' && !req.user.owner_approved) {
    return res.status(403).json({ error: 'Owner account not approved' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireApprovedOwner
};