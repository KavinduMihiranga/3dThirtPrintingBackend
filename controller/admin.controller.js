const Admin = require('../models/admin.model');

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins'
    });
  }
};

// Get single admin
exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin'
    });
  }
};

// Create admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, role, name, phone, nic, gender } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or username already exists'
      });
    }

    const admin = new Admin({
      username,
      email,
      password,
      role: role || 'admin',
      name,
      phone,
      nic,
      gender,
      status: 'Active'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { username, email, role, name, phone, nic, gender, status } = req.body;
    
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update fields
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (nic) admin.nic = nic;
    if (gender) admin.gender = gender;
    if (status) admin.status = status;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin'
    });
  }
};