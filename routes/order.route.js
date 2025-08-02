const express = require('express');
const router = express.Router();
const {
    getOrders,
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder
} = require('../controller/order.controller');

router.get('/', getOrders);
router.post('/', createOrder);  
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;