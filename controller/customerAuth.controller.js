const Customer = require('../models/customer.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 🔐 Customer Login
exports.customerLogin = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Customer login attempt for email:', email);
    
    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Find customer with password field
        const customer = await Customer.findOne({ email }).select('+password');
        
        if (!customer) {
            console.log('❌ No customer found with email:', email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        console.log('✅ Customer found:', customer.email);
        console.log('🔐 Customer status:', customer.status);

        if (customer.status !== 'Active') {
            return res.status(401).json({ 
                success: false,
                message: 'Your account is deactivated. Please contact support.' 
            });
        }

        // Compare passwords
        console.log('🔐 Starting password comparison...');
        const isMatch = await customer.comparePassword(password);
        
        if (!isMatch) {
            console.log('❌ Password does not match for customer:', customer.email);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        console.log('✅ Password matched for customer:', customer.email);
        
        // Generate token
        const token = jwt.sign(
            { 
                id: customer._id, 
                email: customer.email, 
                role: 'customer',
                name: customer.name 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        console.log('✅ Customer login successful, token generated for:', customer.email);
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { 
                id: customer._id, 
                name: customer.name, 
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                role: 'customer'
            }
        });
        
    } catch (err) {
        console.error('❌ Customer login error:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
};

// 📝 Customer Registration
exports.customerRegister = async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    
    console.log('📝 Customer registration attempt for email:', email);
    
    try {
        // Validation
        if (!name || !email || !phone || !password || !address) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingCustomer) {
            if (existingCustomer.email === email) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email already registered' 
                });
            }
            if (existingCustomer.phone === phone) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Phone number already registered' 
                });
            }
        }

        console.log('✅ Creating new customer account...');
        
        // Create new customer
        const customer = new Customer({
            name,
            email: email.toLowerCase().trim(),
            phone,
            password,
            address,
            status: 'Active'
        });

        await customer.save();
        console.log('✅ Customer account created successfully:', customer.email);

        // Generate token for auto-login
        const token = jwt.sign(
            { 
                id: customer._id, 
                email: customer.email, 
                role: 'customer',
                name: customer.name 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { 
                id: customer._id, 
                name: customer.name, 
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                role: 'customer'
            }
        });
        
    } catch (err) {
        console.error('❌ Customer registration error:', err.message);
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'Email or phone number already exists' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }
};

// 🔄 Reset Existing Customer Password
exports.resetCustomerPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    
    console.log('🔄 Manual password reset for:', email);
    
    try {
        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and new password are required' 
            });
        }

        const customer = await Customer.findOne({ email });
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        customer.password = newPassword;
        await customer.save();

        console.log('✅ Password reset successfully for:', email);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (err) {
        console.error('❌ Password reset error:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error during password reset' 
        });
    }
};

// 🔍 Debug: Check customer
exports.debugCustomer = async (req, res) => {
    const { email } = req.body;
    
    try {
        console.log('🔍 Debug: Checking customer:', email);
        
        const customer = await Customer.findOne({ email }).select('+password');
        
        if (!customer) {
            return res.json({ 
                success: false,
                message: 'Customer not found',
                exists: false
            });
        }

        res.json({
            success: true,
            exists: true,
            customer: {
                id: customer._id,
                email: customer.email,
                name: customer.name,
                status: customer.status,
                passwordHash: customer.password
            }
        });
        
    } catch (err) {
        console.error('❌ Debug error:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Debug error' 
        });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    console.log('🔐 Customer forgot password request for email:', email);
    
    try {
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required' 
            });
        }

        const customer = await Customer.findOne({ email });
        
        if (!customer) {
            console.log('📧 Email not found in system:', email);
            return res.json({ 
                success: true, 
                message: 'If that email exists in our system, a reset link has been sent.' 
            });
        }

        console.log('✅ Customer found:', customer.email);

        const resetToken = jwt.sign(
            { id: customer._id, role: 'customer' }, 
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );
        
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer-reset-password?token=${resetToken}`;

        console.log('🔗 Customer Reset link generated:', resetLink);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️ Email credentials not configured. Returning reset link for testing.');
            return res.json({ 
                success: true, 
                message: 'Password reset link generated (email not configured)',
                resetLink: resetLink
            });
        }

          // If email is configured, try to send it
           try {
             const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                 user: process.env.EMAIL_USER,
                 pass: process.env.EMAIL_PASSWORD,
               },
             });
       
             const mailOptions = {
               from: process.env.EMAIL_USER,
               to: email,
               subject: 'Password Reset Request',
               html: `
                 <div style="font-family: Arial, sans-serif;">
                   <h2>Password Reset Request</h2>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">Reset Password</a>
                   <p>This link expires in 1 hour.</p>
                 </div>
               `,
             };
       
             await transporter.sendMail(mailOptions);
             console.log('✅ Password reset email sent to:', email);
             
             res.json({ 
               success: true, 
               message: 'Password reset instructions sent to your email.' 
             });
             
           } catch (emailError) {
             console.error('❌ Email sending failed:', emailError);
             // Still return success but with the reset link
             res.json({ 
               success: true, 
               message: 'Email service temporarily unavailable. Use this reset link:',
               resetLink: resetLink
             });
           }
        
    } catch (err) {
        console.error('❌ Customer forgot password error:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error processing your request.' 
        });
    }

    
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    console.log("🔄 Customer Reset Password Debug:");

    if (!token || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Token and password are required.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        if (decoded.role !== 'customer') {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid token type.' 
            });
        }
        
        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Invalid token or customer not found.' 
            });
        }

        customer.password = password;
        await customer.save();
        
        console.log("✅ Customer password reset successful for:", customer.email);

        res.json({ 
            success: true, 
            message: 'Password reset successful.' 
        });
        
    } catch (err) {
        console.error("❌ Customer reset password error:", err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ 
                success: false,
                message: 'Token has expired. Please request a new reset link.' 
            });
        }
        
        return res.status(400).json({ 
            success: false,
            message: 'Error resetting password.' 
        });
    }
};

// Other methods...
exports.checkAuth = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                role: 'customer'
            }
        });
    } catch (error) {
        console.error('Customer auth check error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.json({
            success: true,
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status,
                createdAt: customer.createdAt
            }
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        const customer = await Customer.findByIdAndUpdate(
            req.user.id,
            { name, phone, address },
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                status: customer.status
            }
        });
    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

exports.debugCustomerData = async (req, res) => {
    try {
        const customer = await Customer.findOne({ email: "vabewugu@forexzig.com" }).select('+password');
        
        if (!customer) {
            return res.json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.json({
            success: true,
            customer: {
                email: customer.email,
                name: customer.name,
                password: customer.password, // This will show the stored hash
                status: customer.status
            }
        });
    } catch (err) {
        console.error('Debug error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Debug error' 
        });
    }
};