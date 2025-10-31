const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: 6,
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true,
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        console.log('🔐 Hashing password for:', this.email);
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password hashed successfully for:', this.email);
        next();
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        next(error);
    }
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('🔐 Comparing passwords for:', this.email);
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('🔐 Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('❌ Password comparison error:', error);
        throw error;
    }
};

// Remove password from JSON output
customerSchema.methods.toJSON = function() {
    const customer = this.toObject();
    delete customer.password;
    return customer;
};

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;