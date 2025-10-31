const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const Customer = require('../models/customer.model');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token, authorization denied' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        let user;
        if (decoded.role === 'customer') {
            user = await Customer.findById(decoded.id);
        } else {
            user = await Admin.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Token is not valid' 
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: decoded.role || 'admin',
            name: user.name
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Token is not valid' 
        });
    }
};

module.exports = authMiddleware;