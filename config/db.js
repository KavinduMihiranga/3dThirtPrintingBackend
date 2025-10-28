const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGODB_URI from your .env file
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('URI:', mongoURI.replace(/\/\/.*@/, '//<credentials>@')); // Hide credentials in log

    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;