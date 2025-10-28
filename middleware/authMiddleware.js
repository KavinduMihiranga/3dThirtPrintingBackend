const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verify admin still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    if (admin.status !== 'Active') {
      return res.status(401).json({ 
        success: false,
        message: 'Account deactivated' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    return res.status(403).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

module.exports = verifyToken;