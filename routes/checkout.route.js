const express = require('express');
const router = express.Router();
const {
    getCheckouts,
    createCheckout,
    getCheckout,
    updateCheckout,
    deleteCheckout
} = require('../controller/checkout.controller');

router.get('/', getCheckouts);
router.post('/', createCheckout);  
router.get('/:id', getCheckout);
router.put('/:id', updateCheckout);
router.delete('/:id', deleteCheckout);

module.exports = router;