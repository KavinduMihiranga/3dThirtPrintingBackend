const { get } = require('mongoose');
const DesignInquiry = require('../models/designInquiry.model');

// Create new design inquiry
const createDesignInquiry = async (req, res) => {
  try {

    console.log('=== Design Inquiry Creation ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const inquiryData = {
      customerName: req.body.customerName,
      email: req.body.email,
      description: req.body.description,
      designPreview: req.body.designPreview || null,
      designFile: `/uploads/designs/${req.file.filename}` // Save relative path
    };
    console.log('Saving inquiry:', inquiryData);
    const inquiry = await DesignInquiry.create(inquiryData);
    res.status(201).json({ 
      success: true, 
      data: inquiry,
      message: 'Design inquiry created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all inquiries (for admin)
const getDesignInquiries = async (req, res) => {
  try {
    const data = await DesignInquiry.find().sort({ date: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single inquiry by ID
const getDesignInquiryById = async (req, res) => {
  try {
    const inquiry = await DesignInquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDesignInquiryStatus = async (req, res) => {
try {
    const { status, price } = req.body;
    const updatedOrder = await DesignInquiry.findByIdAndUpdate(
      req.params.id,
      { status, price },
      { new: true }
    );
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  createDesignInquiry,
  getDesignInquiries,
  getDesignInquiryById,
  updateDesignInquiryStatus,
};