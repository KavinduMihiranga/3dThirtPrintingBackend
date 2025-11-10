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

    // Parse designData if it's a string
    let designData = {};
    if (req.body.designData) {
      try {
        designData = typeof req.body.designData === 'string' 
          ? JSON.parse(req.body.designData) 
          : req.body.designData;
      } catch (parseError) {
        console.error('Error parsing designData:', parseError);
      }
    }

    const inquiryData = {
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone || '',
      notes: req.body.notes || '',
      description: req.body.description || 'Custom T-shirt design',
      designData: designData,
      totalItems: parseInt(req.body.totalItems) || 0,
      totalPrice: parseFloat(req.body.totalPrice) || 0,
      tshirtColor: req.body.tshirtColor || '#3b82f6',
      sizes: req.body.sizes ? (typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes) : {},
      designPreview: req.body.designPreview || null,
      designFile: `/uploads/designs/${req.file.filename}`, // Save relative path
      price: parseFloat(req.body.totalPrice) || 0 // Set initial price
    };

    console.log('Saving inquiry:', inquiryData);
    const inquiry = await DesignInquiry.create(inquiryData);
    
    res.status(201).json({ 
      success: true, 
      data: inquiry,
      message: 'Design inquiry created successfully'
    });
  } catch (error) {
    console.error('Error creating design inquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all inquiries (for admin)
const getDesignInquiries = async (req, res) => {
  try {
    const data = await DesignInquiry.find().sort({ createdAt: -1 }); // Fixed: use createdAt instead of date
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

// Update design inquiry
const updateDesignInquiryStatus = async (req, res) => {
  try {
    const { status, price } = req.body;
    const updateData = {};
    
    if (status !== undefined) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    
    const updatedOrder = await DesignInquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    
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