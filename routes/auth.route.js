const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  forgotPassword, 
  resetPassword,
  checkAuth 
} = require('../controller/auth.controller');
const verifyToken = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route
router.get('/check-auth', verifyToken, checkAuth);

module.exports = router;