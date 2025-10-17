// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   customerName: {
//     type: String,
//     required: [true, "Please enter your customer name"],
//     unique: false,
//     trim: true,
//   },
//   tShirtName: {
//     type: String,
//     required: [true, "Please enter your t-shirt name"],
//     unique: false,
//     trim: true,
//   },
//   address: {
//     type: String,
//     required: [true, "Please enter your address"],
//     unique: false,
//     trim: true,
//   },
//   qty: {
//     type: String,
//     required: [true, "Please enter your quantity"],
//     unique: false,
//     min:[1, "Quantity must be at least 1"]
//   },
//   date: {
//     type: String,
//     required: [true, "Please enter your date"],
//     unique: false,
//   },
//   status: {
//     type: String,
//     required: [true, "Please enter your status"],
//     unique: false,
//     default: "Pending",
//     enum: ["Pending", "Processing", "Completed", "Cancelled"],
//   },
//    designFile: {
//       type: String,
//       required: false, // optional
//     },
//     amount: {
//       type: Number,
//       required: [true, "Please enter the amount"],
//     },
//     tShirtName: {
//       type: String,
//       required: [true, "Please enter the t-shirt name"],  
//     },
//     paymentId: { type: String },
//     paymentStatus: { type: String, default: 'unpaid' },
// }, {
//   timestamps: true,
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    tShirtName: { type: String, required: true },
    address: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    date: { type: String, default: new Date().toISOString().split("T")[0] },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
    },
    designFile: { type: String },
    amount: { type: Number, required: true },
    paymentId: { type: String },
    paymentStatus: { type: String, default: "unpaid" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
