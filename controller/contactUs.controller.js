// controller/contactUs.controller.js
const ContactUs = require('./../models/contactUs.model');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/contact-us/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contact-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('designFile');

const getContactUsRequests = async (req, res) => {
    try {
        const contactUs = await ContactUs.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: contactUs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createContactUsRequest = async (req, res) => {
    try {
        // Handle file upload first
        upload(req, res, async function (err) {
            if (err) {
                console.error('File upload error:', err);
                return res.status(400).json({ 
                    success: false, 
                    message: 'File upload failed: ' + err.message 
                });
            }

            try {
                const { name, email, phone, subject, quantity, address, message } = req.body;

                // Validate required fields
                if (!name || !email || !phone || !subject || !message) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: name, email, phone, subject, and message are required'
                    });
                }

                // Create contact us entry
                const contactData = {
                    name,
                    email,
                    phone,
                    subject,
                    message,
                    status: 'new',
                    priority: 'medium'
                };

                // Add optional fields if they exist
                if (quantity) contactData.quantity = parseInt(quantity);
                if (address) contactData.address = address;
                if (req.file) {
                    contactData.designFile = `/uploads/contact-us/${req.file.filename}`;
                }

                const contactUs = await ContactUs.create(contactData);
                
                try {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: 'kavindutest0001@gmail.com', // Your company email
                        subject: `New Contact Us Request: ${subject}`,
                        html: `
                            <h2>New Contact Us Request Received</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong> ${message}</p>
                            ${quantity ? `<p><strong>Quantity:</strong> ${quantity}</p>` : ''}
                            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
                            <br>
                            <p><em>This message was sent from your website contact form.</em></p>
                        `
                    };

                    await transporter.sendMail(mailOptions);
                    console.log('Email notification sent successfully');
                } catch (emailError) {
                    console.error('Failed to send email notification:', emailError);
                    // Don't fail the request if email fails
                }


                    try {
                    const customerMailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email, // Customer's email from the form
                        subject: `Thank you for contacting us - ${subject}`,
                        html: `
                        <h2>Thank you for contacting us!</h2>
                        <p>Dear ${name},</p>
                        <p>We have received your message and will get back to you within 24 hours.</p>
                        <p><strong>Your Message:</strong></p>
                        <p>${message}</p>
                        <br>
                        <p>Best regards,<br>Your Company Team</p>
                        `
                    };

                    await transporter.sendMail(customerMailOptions);
                    console.log('✅ Auto-reply email sent to customer');
                    } catch (autoReplyError) {
                    console.error('❌ Auto-reply email failed:', autoReplyError.message);
                    }

                res.status(201).json({
                    success: true,
                    message: 'Contact request submitted successfully',
                    data: contactUs
                });

            } catch (error) {
                console.error('Error creating contact:', error);
                res.status(500).json({ 
                    success: false, 
                    message: error.message 
                });
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const getContactUsRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const contactUs = await ContactUs.findById(id);
        
        if (!contactUs) {
            return res.status(404).json({
                success: false,
                message: 'Contact request not found'
            });
        }
        
        res.status(200).json({ success: true, data: contactUs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateContactUsRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, notes } = req.body;

        const contactUs = await ContactUs.findByIdAndUpdate(
            id, 
            {
                status,
                priority,
                assignedTo,
                notes,
                updatedAt: new Date()
            }, 
            { new: true, runValidators: true }
        );

        if (!contactUs) {
            return res.status(404).json({ 
                success: false,
                message: 'Contact request not found' 
            });
        }

        const updatedContact = await ContactUs.findById(id);
        res.status(200).json({ 
            success: true,
            message: 'Contact request updated successfully',
            data: updatedContact 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteContactUsRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const contactUs = await ContactUs.findByIdAndDelete(id);

        if (!contactUs) {
            return res.status(404).json({ 
                success: false,
                message: 'Contact request not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Contact request deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD  // your email password or app password
  }
});


module.exports = {
    getContactUsRequests,
    createContactUsRequest,
    getContactUsRequest,
    updateContactUsRequest,
    deleteContactUsRequest,
    
};