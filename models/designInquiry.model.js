const mongoose = require("mongoose");

const designInquirySchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    description: { type: String },
    notes: { type: String }, // Add this field
    designData: { type: Object }, // Add this field to store design information
    totalItems: { type: Number, default: 0 }, // Add this field
    totalPrice: { type: Number, default: 0 }, // Add this field
    tshirtColor: { type: String }, // Add this field
    sizes: { type: Object }, // Add this field
    billingAddress: { type: Object },
    shippingAddress: { type: Object },
    designPreview: { type: String }, // Base64 PNG or image URL
    designFile: { type: String }, // Base64 GLB / GLTF if needed
    price: { type: Number }, // Make sure this field exists
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true // This will automatically add createdAt and updatedAt
  }
);

module.exports = mongoose.model("DesignInquiry", designInquirySchema);