
const mongoose = require("mongoose");

const designInquirySchema = new mongoose.Schema(
  {

  customerName: { type: String, required: true },
  email: { type: String },
   phone: {
    type: String
  },
  description: { type: String },
  billingAddress: {
    type: Object
  },
  shippingAddress: {
    type: Object
  },
  designPreview: { type: String }, // Base64 PNG or image URL
  designFile: { type: String }, // Base64 GLB / GLTF if needed
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports=mongoose.model("DesignInquiry", designInquirySchema);
