const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 🔐 Admin Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for email:', email);
  
  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('❌ No admin found with email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    if (admin.status !== 'Active') {
      return res.status(401).json({ 
        success: false,
        message: 'Your account is deactivated. Please contact administrator.' 
      });
    }

    console.log('✅ Admin found:', admin.email);
    
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      console.log('❌ Password does not match for admin:', admin.email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ Password matched for admin:', admin.email);
    
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email, 
        role: admin.role,
        username: admin.username 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful, token generated for:', admin.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        id: admin._id, 
        username: admin.username, 
        email: admin.email,
        role: admin.role,
        name: admin.name
      }
    });
    
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  console.log('🔐 Forgot password request for email:', email);
  
  try {
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    
    // For security, always return success even if email doesn't exist
    if (!admin) {
      console.log('📧 Email not found in system:', email);
      return res.json({ 
        success: true, 
        message: 'If that email exists in our system, a reset link has been sent.' 
      });
    }

    console.log('✅ Admin found:', admin.email);

    // Generate reset token
    const resetToken = jwt.sign(
      { id: admin._id }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log('🔗 Reset link generated:', resetLink);

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured. Returning reset link for testing.');
      return res.json({ 
        success: true, 
        message: 'Password reset link generated (email not configured)',
        resetLink: resetLink // Return link for testing
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
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error processing your request.' 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  console.log("🔄 Reset Password Debug:");
  console.log("📧 Token received:", token ? "Yes" : "No");
  console.log("🔑 Password received:", password ? "Yes" : "No");

  if (!token || !password) {
    console.log("❌ Missing token or password");
    return res.status(400).json({ 
      success: false,
      message: 'Token and password are required.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log("✅ Token decoded successfully:", decoded);
    
    const admin = await Admin.findById(decoded.id);
    console.log("🔍 Admin found:", admin ? admin.email : "No admin found");

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid token or user not found.' 
      });
    }

    admin.password = password;
    await admin.save();
    
    console.log("✅ Password reset successful for:", admin.email);

    res.json({ 
      success: true, 
      message: 'Password reset successful.' 
    });
    
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false,
        message: 'Token has expired. Please request a new reset link.' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid token format.' 
      });
    }
    
    return res.status(400).json({ 
      success: false,
      message: 'Error resetting password.' 
    });
  }
};

// Check Auth Status
exports.checkAuth = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};