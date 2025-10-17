// controllers/payment.controller.js
const Order = require('../models/Order');
const Razorpay = require('razorpay'); // or replace with your acquirer sdk
const crypto = require('crypto');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper: validate request body basics (simple)
function ensureBodyFields(body, fields = []) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null) return false;
  }
  return true;
}

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const idempotencyKey = req.header('Idempotency-Key') || req.header('idempotency-key') || null;
    const { amount, currency = 'LKR', receipt, customer = {}, metadata = {} } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // If idempotency key provided, return existing order for same key (simple implementation)
    if (idempotencyKey) {
      const existing = await Order.findOne({ 'metadata.idempotencyKey': idempotencyKey });
      if (existing) {
        return res.status(200).json({ success: true, order: existing, note: 'idempotent-reuse' });
      }
    }

    // Razorpay expects amount in smallest currency unit (e.g., paise). We already require smallest unit.
    const options = {
      amount: amount, // smallest unit
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    // Create order at processor
    const order = await razorpayInstance.orders.create(options);

    // Save local order record
    const newOrder = new Order({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
      customer,
      metadata: { ...metadata, idempotencyKey }
    });

    await newOrder.save();

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, error: 'Missing fields (orderId, paymentId, signature required)' });
    }

    // Compute expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const expected = hmac.digest('hex');

    if (expected !== signature) {
      // update order status failed (idempotent)
      await Order.findOneAndUpdate({ orderId }, { status: 'failed', updatedAt: Date.now() });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // signature valid -> update order record
    const updated = await Order.findOneAndUpdate(
      { orderId },
      {
        status: 'paid',
        paymentId,
        signature,
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Optional: fetch payment details from processor to validate amounts, currency etc
    // const paymentDetails = await razorpayInstance.payments.fetch(paymentId);

    return res.json({ success: true, message: 'Payment verified', order: updated });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};

// POST /api/payments/webhook
exports.webhookHandler = async (req, res) => {
  try {
    // Razorpay sends raw body; header 'x-razorpay-signature' contains signature
    const webhookSecret = process.env.WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.header('x-razorpay-signature');

    const body = req.body; // raw body passed by express.raw middleware
    if (!signature || !webhookSecret) {
      console.warn('webhook missing signature or secret');
      return res.status(400).send('Missing webhook signature or secret');
    }

    // Compute expected signature
    const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    if (expected !== signature) {
      console.warn('webhook signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(body.toString());
    const event = payload.event;
    const entity = payload.payload || {};

    // Handle relevant events e.g., payment.captured, payment.failed, order.paid (depends on your processor)
    if (event === 'payment.captured' && entity.payment && entity.payment.entity) {
      const p = entity.payment.entity;
      await Order.findOneAndUpdate({ orderId: p.order_id }, {
        status: 'paid',
        paymentId: p.id,
        updatedAt: Date.now()
      });
    } else if (event === 'payment.failed' && entity.payment && entity.payment.entity) {
      const p = entity.payment.entity;
      await Order.findOneAndUpdate({ orderId: p.order_id }, {
        status: 'failed',
        updatedAt: Date.now()
      });
    } else if (event === 'payment.refunded' && entity.payment && entity.payment.entity) {
      const p = entity.payment.entity;
      await Order.findOneAndUpdate({ orderId: p.order_id }, {
        status: 'refunded',
        updatedAt: Date.now()
      });
    }

    // Always respond 200 to acknowledge
    return res.status(200).send('OK');
  } catch (err) {
    console.error('webhookHandler error:', err);
    return res.status(500).send('Webhook processing failed');
  }
};

// POST /api/payments/refund
exports.createRefund = async (req, res) => {
  try {
    // NOTE: this is a stub. Implement processor refund API here.
    const { paymentId, amount } = req.body;
    if (!paymentId) return res.status(400).json({ success: false, error: 'paymentId required' });

    // Example with Razorpay:
    // const refund = await razorpayInstance.payments.refund(paymentId, { amount });

    // For now, update order record to refunded (demo)
    const order = await Order.findOneAndUpdate({ paymentId }, { status: 'refunded', updatedAt: Date.now() }, { new: true });

    return res.json({ success: true, message: 'Refund (simulated) applied', order });
  } catch (err) {
    console.error('createRefund error:', err);
    return res.status(500).json({ success: false, error: 'Refund failed' });
  }
};
