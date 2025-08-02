const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "please enter your name"] },
  category: { type: String, required: [true, "please enter your category"] },
  description: { type: String, required: [true, "please enter your description"] },
  price: { type: Number, required: [true, "please enter your price"] },
  qty: { type: Number, required: [true, "please enter your qty"] },
  status: { type: String, required: [true, "please enter your status"] },
  image: { type: String }, // optional
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
