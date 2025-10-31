// models/ContactUs.js
const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    },
    subject: { 
      type: String,
      required: true
    },
    quantity: { 
      type: Number 
    },
    address: { 
      type: String 
    },
    message: { 
      type: String, 
      required: true 
    },
    designFile: { 
      type: String 
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'resolved', 'spam'],
      default: 'new'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);