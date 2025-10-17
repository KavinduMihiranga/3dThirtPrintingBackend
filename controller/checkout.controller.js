const { get } = require('mongoose');
const Checkout=require('../models/checkout.model');

const getCheckouts = async (req, res) => {
    try {
        const checkout = await Checkout.find();
        res.status(200).json({data:checkout});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createCheckout = async (req, res) => {
    try {
        const checkout = await Checkout.create(req.body);
        res.status(201).json({data: checkout});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCheckout = async (req, res)=>{
    try {
        const {id} = req.params;
        const checkout = await Checkout.findById(id);
        res.status(200).json({data: checkout});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateCheckout = async (req, res) => {
    try {
        const {id} = req.params;
        const checkout = await Checkout.findByIdAndUpdate(
            id, 
            req.body, {new: true, runValidators: true}

        );

        if (!checkout) {
            return res.status(404).json({ message: 'Checkout not found' });
        }

        const updateCheckout = await Checkout.findById(id);
        res.status(200).json({data: updateCheckout});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCheckout = async (req, res) => {
    try {
        const {id} = req.params;
        const checkout = await Checkout.findByIdAndDelete(id);

        if (!checkout) {
            return res.status(404).json({ message: 'Checkout not found' });
        }

        res.status(200).json({ message: 'Checkout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCheckouts,
    createCheckout,
    getCheckout,
    updateCheckout,
    deleteCheckout,
};