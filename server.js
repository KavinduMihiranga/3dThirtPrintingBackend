// Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Import routes
const systemAdminRoute = require("./routes/admin.route");
const systemProductRoute = require("./routes/product.route");
const systemOrderRoute = require("./routes/order.route");
const systemCustomerRoute = require("./routes/customer.route");
const systemCheckoutRoute = require("./routes/checkout.route");
const systemPaymentRoute = require("./routes/payment.route");
const systemAnnouncementRoute = require("./routes/announcement.route");
const systemConfirmPaymentRoute = require("./routes/routes.paymentConfirm.routes");
const systemdesignInquiryRoute = require("./routes/designInquiry.route");
const systemAuthRoute = require("./routes/auth.route");

// Verify environment variables
console.log('🔍 Checking environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Not found');
console.log('PORT:', process.env.PORT || '5000');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5176', 
  'http://localhost:9000', 
  'https://localhost:90001', 
  'http://localhost:3000',
  'http://localhost:5000'
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Serving static files from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

app.use("/api/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", systemAuthRoute);
app.use("/api/admin", systemAdminRoute);
app.use("/api/product", systemProductRoute);
app.use("/api/order", systemOrderRoute);
app.use("/api/customer", systemCustomerRoute);
app.use("/api/checkout", systemCheckoutRoute);
app.use("/api/payments", systemPaymentRoute);
app.use("/api/announcements", systemAnnouncementRoute);
app.use("/api/payment", systemConfirmPaymentRoute);
app.use("/api/design-inquiry", systemdesignInquiryRoute);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running...', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log('✨ Ready to accept requests');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();