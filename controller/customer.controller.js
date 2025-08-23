const { get } = require('mongoose');
const Customer=require('../models/customer.model');

const getCustomers = async (req, res) => {
    try {
        const customer = await Customer.find();
        res.status(200).json({data:customer});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json({data: customer});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomer = async (req, res)=>{
    try {
        const {id} = req.params;
        const customer = await Customer.findById(id);
        res.status(200).json({data: customer});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateCustomer = async (req, res) => {
    try {
        const {id} = req.params;
        const customer = await Customer.findByIdAndUpdate(
            id, 
            req.body, {new: true, runValidators: true}

        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const updatedCustomer = await Customer.findById(id);
        res.status(200).json({data: updateCustomer});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const {id} = req.params;
        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
};