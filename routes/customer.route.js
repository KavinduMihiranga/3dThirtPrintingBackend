const express = require('express');
const router = express.Router();
const {
    getCustomers,
    createCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controller/customer.controller');

router.get('/', getCustomers);
router.post('/', createCustomer);  
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;