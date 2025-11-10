require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const checkAndCreateAdmin = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ No MongoDB URI found in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('');

    // Define User schema
    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String,
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    console.log('');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Current admin details:');
      console.log('  - Username:', existingAdmin.username);
      console.log('  - Email:', existingAdmin.email);
      console.log('  - Role:', existingAdmin.role);
      console.log('  - Password (hashed):', existingAdmin.password.substring(0, 20) + '...');
      console.log('');
      
      // Test if password is correct
      console.log('🔐 Testing password...');
      const isPasswordCorrect = await bcrypt.compare('admin123', existingAdmin.password);
      
      if (isPasswordCorrect) {
        console.log('✅ Password is correct! You can login with:');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
      } else {
        console.log('❌ Password does not match!');
        console.log('');
        console.log('Would you like to delete and recreate the admin? (y/n)');
        console.log('Run with --force flag to automatically recreate:');
        console.log('   node checkAndCreateAdmin.js --force');
        
        // Check for force flag
        if (process.argv.includes('--force')) {
          console.log('');
          console.log('🗑️  Deleting existing admin...');
          await User.deleteOne({ email: 'admin@example.com' });
          console.log('✅ Deleted');
          
          // Create new admin
          await createNewAdmin(User);
        }
      }
    } else {
      console.log('📝 No admin user found. Creating new admin...');
      await createNewAdmin(User);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

async function createNewAdmin(User) {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('');
    console.log('🎉 Admin created successfully!');
    console.log('==========================================');
    console.log('Login Credentials:');
    console.log('  Username: admin');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('  Role: admin');
    console.log('==========================================');
    console.log('');
    console.log('✨ You can now login at http://localhost:5173/login');
    
    // Verify the password works
    const testAdmin = await User.findOne({ email: 'admin@example.com' });
    const testPassword = await bcrypt.compare('admin123', testAdmin.password);
    console.log('🔐 Password verification:', testPassword ? '✅ PASSED' : '❌ FAILED');
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    throw error;
  }
}

checkAndCreateAdmin();