const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, "Please enter your customer name"],
    unique: false,
  },
  tShirtName: {
    type: String,
    required: [true, "Please enter your t-shirt name"],
    unique: false,
  },
  address: {
    type: String,
    required: [true, "Please enter your address"],
    unique: false,
  },
  qty: {
    type: String,
    required: [true, "Please enter your quantity"],
    unique: false,
  },
  date: {
    type: String,
    required: [true, "Please enter your date"],
    unique: false,
  },
  status: {
    type: String,
    required: [true, "Please enter your status"],
    unique: false,
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
