const express = require('express');
const router = express.Router();
const { confirmPayment } = require('../controller/paymentConfirm.controller');

router.post('/confirm', confirmPayment); // ✅ This matches /api/payment/confirm

module.exports = router;
