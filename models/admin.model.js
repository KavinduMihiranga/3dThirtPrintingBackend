const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin']
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  nic: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female', 'Other']
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive']
  }
}, {
  timestamps: true
});

// Password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Check if stored password is bcrypt hashed
    if (this.password.startsWith('$2b$')) {
      return await bcrypt.compare(candidatePassword, this.password);
    } else {
      // Handle plain text passwords (for existing data)
      const isMatch = candidatePassword === this.password;
      if (isMatch) {
        // Auto-convert to bcrypt
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(candidatePassword, salt);
        await this.save();
      }
      return isMatch;
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.password.startsWith('$2b$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Admin', adminSchema);