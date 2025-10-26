const Order = require('../models/order.model');
const Product = require('../models/product.model');
const nodemailer = require("nodemailer");
const generateInvoiceHTML = require("../utils/templates/invoiceTemplate.js");

const sendInvoiceEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kavindutest0001@gmail.com", // replace with your email
      pass: "wfxczmpcrvrkkcax",    // use app password if 2FA enabled
    },
  });

  const mailOptions = {
    from: "kavindutest0001@gmail.com",
    to: order.email,
    subject: `Invoice for Order ${order.orderId}`,
    html: generateInvoiceHTML(order),
  };

  await transporter.sendMail(mailOptions);
};


const confirmPayment = async (req, res) => {
  const { order_id } = req.body;

  try {
    // 🔍 Validate order ID
    if (!order_id) {
      return res.status(400).json({ success: false, message: "Missing order_id" });
    }

    // 🔍 Find the order
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Update payment status
    order.paymentStatus = "paid";
    await order.save();

    // 🔍 Find the product by name
    const productName = order.tShirtName;
    const quantityOrdered = order.qty;

    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ success: false, message: `Product "${productName}" not found` });
    }

    // ⚠️ Check stock availability
    if (product.qty < quantityOrdered) {
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    // ✅ Deduct stock
    product.qty -= quantityOrdered;
    await product.save();
    console.log("📧 Sending invoice to:", order.email);

// ✅ Send invoice email
    await sendInvoiceEmail({
      orderId: order._id,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      items: [
        { name: order.tShirtName, qty: order.qty, price: order.amount }
      ],
      totalAmount: order.amount,
      paymentStatus: order.paymentStatus,
      date: new Date(order.date).toISOString().split("T")[0],
    });


    // 🎉 Respond with success
    return res.status(200).json({
      success: true,
      message: "Payment confirmed and product stock updated",
      data: {
        orderId: order._id,
        productName: product.name,
        remainingStock: product.qty,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  confirmPayment,
};
