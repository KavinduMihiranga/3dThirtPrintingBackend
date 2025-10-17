const express = require('express');
const router = express.Router();
const {
    getOrders,
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder,
    payhereNotify
} = require('../controller/order.controller');

router.get('/', getOrders);
router.post('/', createOrder);  
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// PayHere notify URL
router.post('/notify', payhereNotify);

module.exports = router;