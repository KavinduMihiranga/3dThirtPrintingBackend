const mongoose = require('mongoose');
const User = require('./models/user.model'); // Fixed path to match your file structure
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create new admin user
    const admin = new User({
      email: 'admin@example.com',
      password: 'admin123' // Will be hashed automatically by the pre-save hook
    });

    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();