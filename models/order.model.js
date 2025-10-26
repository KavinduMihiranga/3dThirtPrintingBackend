
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: false },
    tShirtName: { type: String, required: false },
    address: { type: String, required: false },
    qty: { type: Number, required: false, min: 1 },
    date: { type: String, default: new Date().toISOString().split("T")[0] },
    status: {
      type: String,
      unique: false,
      default: "Pending",
    },
    designFile: { type: String },
    amount: { type: Number, required: false },
    paymentId: { type: String },
    paymentStatus: { type: String, default: "unpaid" },
    email: { type: String },         
    phone: { type: String },         
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
