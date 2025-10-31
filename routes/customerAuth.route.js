const express = require('express');
const router = express.Router();

// Try different import paths - use the correct one for your structure
let customerAuthController;
try {
    // Try relative path first
    customerAuthController = require('../controller/customerAuth.controller');
} catch (error) {
    try {
        // Try same directory
        customerAuthController = require('./customerAuth.controller');
    } catch (error2) {
        console.error('❌ Could not find customerAuth.controller');
        console.error('Please check the file exists in controllers/ folder');
        process.exit(1);
    }
}

const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/customer-login', customerAuthController.customerLogin);
router.post('/customer-register', customerAuthController.customerRegister);
router.post('/customer-forgot-password', customerAuthController.forgotPassword);
router.post('/customer-reset-password', customerAuthController.resetPassword);

// Debug routes (temporary)
router.post('/debug-customer', customerAuthController.debugCustomer);
router.post('/reset-customer-password', customerAuthController.resetCustomerPassword);

// Protected routes (require customer authentication)
router.get('/customer-profile', authMiddleware, customerAuthController.getProfile);
router.put('/customer-profile', authMiddleware, customerAuthController.updateProfile);
router.get('/customer-check-auth', authMiddleware, customerAuthController.checkAuth);
router.get('/debug-customer-data', customerAuthController.debugCustomerData);

module.exports = router;