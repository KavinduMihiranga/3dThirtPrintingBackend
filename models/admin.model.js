const mongoose = require('mongoose');

const addminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    gender: {
        type: String,
        required: [true, "please enter your gender"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
    },
    nic: {
        type: String,
        required: [true, "please enter your nic"],
        unique: true
    },
    phone: {
        type: String,
        required: [true, "please enter your phone number"],
        unique: true
    },
    addressLine1: {
        type: String,
        required: [true, "please enter your address line 1"],
    },
    addressLine2: {
        type: String,
        required: [true, "please enter your address line 2"],
    },
    city: {
        type: String,
        required: [true, "please enter your city"],
    },
    country: {
        type: String,
        required: [true, "please enter your country"],
    }
    
},
{
    timestamps: true,
}
);

const Admin = mongoose.model('Admin', addminSchema);
module.exports = Admin;