const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const systemAdminRoute=require("./routes/admin.route");
const systemProductRoute=require("./routes/product.route");
const systemOrderRoute=require("./routes/order.route");

dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5176', "http://localhost:9000", 'https://localhost:90001', 'http://localhost:3000','http://localhost:5000'];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.log("Blocked by CORS: ", origin); //Debugging
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        allowedHeaders: "Content-Type, Authorization",
    })
);

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Rotes
app.use("/api/admin", systemAdminRoute);
app.use("/api/product", systemProductRoute);
app.use("/api/order", systemOrderRoute);
app.use("/api/uploads", express.static("uploads"));

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(5000, () => {
    connectDB();
    console.log('Server started on port 5000');
});