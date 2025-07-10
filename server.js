const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:5176', "http://localhost:9000", 'https://localhost:90001'];

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
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: "Content-Type, Authorization",
    })
);

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(5000, () => {
    connectDB();
    console.log('Server started on port 5000');
});