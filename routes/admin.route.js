const express = require('express');
const router = express.Router();
const {
    getAdmins,
    createAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin
} = require('../controller/admin.controller');

router.get('/', getAdmins);
router.post('/', createAdmin);  
router.get('/:id', getAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router;