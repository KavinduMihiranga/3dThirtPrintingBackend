const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
    },
    phone: {
        type: String,
        required: [true, "please enter your phone number"],
    },
    billingAddressLine1: {
        type: String,
        required: [true, "please enter your address line 1"],
    },
    billingAddressLine2: {
        type: String,
        required: [true, "please enter your address line 2"],
    },
    billingCity: {
        type: String,
        required: [true, "please enter your city"],
    },
    billingProvince: {
        type: String,
        required: [true, "please enter your province"],
    },
    shippingAddressLine1: {
        type: String,
        required: [true, "please enter your address line 1"],
    },
    shippingAddressLine2: {
        type: String,
        required: [true, "please enter your address line 2"],
    },
    shippingCity: {
        type: String,
        required: [true, "please enter your city"],
    },
    shippingProvince: {
        type: String,
        required: [true, "please enter your province"],
    },
    status: {
        type: String,
        required: [true, "please enter your status"],
    }
    
},
{
    timestamps: true,
}
);

const Checkout = mongoose.model('Checkout', checkoutSchema);
module.exports = Checkout;