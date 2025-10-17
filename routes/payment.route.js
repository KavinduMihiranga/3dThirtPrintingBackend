// backend/routes/payments.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const Product = require("../models/product.model");

router.post("/", async (req, res) => {
  try {
    // simulate payment success
    const transactionId = "TXN-" + Date.now();

    // extract order details from frontend
    const { customerName, email, phone, items, totalAmount, address } = req.body;

    // Reduce product quantity
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.qty < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      product.qty -= item.qty;
      await product.save();
    }



    // save order to database
    const newOrder = new Order({
      customerName,
      tShirtName: items.map(i => i.name).join(", "),
      address,
      qty: items.reduce((sum, i) => sum + i.qty, 0),
      date: new Date().toLocaleDateString(),
      status: "Processing",
      razorpayPaymentId: transactionId,
      paymentStatus: "Paid"

    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment Successful & Order Created!",
      transactionId,
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ Create Payment (Mock API)
router.post("/create", async (req, res) => {
  try {
    const { amount, currency = "LKR", orderId } = req.body;

    if (!amount || !currency || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Simulate successful transaction
    const paymentResponse = {
      success: true,
      orderId,
      amount,
      currency,
      status: "SUCCESS",
      transactionId: "TXN-" + Date.now(),
      message: "Payment processed successfully",
    };

    return res.status(200).json(paymentResponse);
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
});

// ✅ Verify Payment (Mock)
router.post("/verify", (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "Missing transactionId",
    });
  }

  return res.status(200).json({
    success: true,
    transactionId,
    status: "VERIFIED",
  });
});

module.exports = router;
