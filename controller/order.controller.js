const { get } = require('mongoose');
const Order=require('../models/order.model');
const Product = require('../models/product.model');
require('dotenv').config();

const getOrders = async (req, res) => {
    try {
        const order = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({data:order});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createOrder = async (req, res) => {
   console.log("🟢 Received order data:");
    try {
       const { customerName, address, tShirtName, qty, amount, paymentId,email, phone } = req.body;
    // if (!customerName || !amount) {
      if (!customerName || !tShirtName || !address || !qty) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

const newOrder = new Order({
      customerName,
      address,
      tShirtName,
      qty,
      amount,
      paymentId,
      email,
      phone,
    });
    await newOrder.save();
   res.status(201).json({ success: true, data: newOrder });
    }catch (error) {
         console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
    }

// try {
//     const {
//       customerName,
//       email,
//       phone,
//       tShirtName,
//       designFile,
//       designPreview,
//       description,
//       qty,
//       price,
//       billingAddress,
//       shippingAddress,
//       status = 'pending',
//       paymentStatus = 'pending'
//     } = req.body;

//     console.log('📦 Creating order with data:', req.body);

//     // Validate required fields
//     if (!customerName || !email || !phone || !shippingAddress) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: customerName, email, phone, shippingAddress are required'
//       });
//     }

//     const order = new Order({
//       customerName,
//       email,
//       phone,
//       tShirtName: tShirtName || 'Custom T-Shirt Design',
//       designFile,
//       designPreview,
//       description: description || 'Custom T-Shirt Design Order',
//       qty: qty || 1,
//       price: price || 0,
//       billingAddress,
//       shippingAddress,
//       status,
//       paymentStatus,
//       orderDate: new Date()
//     });

//     await order.save();

//     console.log('✅ Order created successfully:', order._id);

//     res.status(201).json({
//       success: true,
//       message: 'Order created successfully',
//       data: order
//     });

//   } catch (error) {
//     console.error('❌ Error creating order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating order',
//       error: error.message
//     });
//   }

};

// PayHere Notify (server-to-server verification)
const payhereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
    const local_md5sig = crypto
      .createHash('md5')
      .update(
        merchant_id + order_id + payhere_amount + payhere_currency + status_code + crypto.createHash('md5').update(merchant_secret).digest('hex')
      )
      .digest('hex')
      .toUpperCase();

    if (local_md5sig !== md5sig) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (parseInt(status_code) === 2) {
      await Order.findByIdAndUpdate(order_id, { status: 'Paid' });
      console.log(`✅ Order ${order_id} payment successful`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere Notify Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    deleteOrder,
    updateOrder,
    payhereNotify,
};