const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
    getAdmins,
    createAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin
} = require('../controller/admin.controller');

// Protected admin routes
router.get('/', verifyToken, getAdmins);
router.post('/', verifyToken, createAdmin);  
router.get('/:id', verifyToken, getAdmin);
router.put('/:id', verifyToken, updateAdmin);
router.delete('/:id', verifyToken, deleteAdmin);

module.exports = router;