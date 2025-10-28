// scripts/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/admin.model');
require('dotenv').config();

const createSampleAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb');
    
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be auto-hashed
      role: 'admin',
      name: 'System Administrator',
      phone: '1234567890',
      status: 'Active'
    });
    
    await admin.save();
    console.log('✅ Sample admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createSampleAdmin();