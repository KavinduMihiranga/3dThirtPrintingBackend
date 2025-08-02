const { get } = require('mongoose');
const Admin=require('../models/admin.model');

const getAdmins = async (req, res) => {
    try {
        const admin = await Admin.find();
        res.status(200).json({data:admin});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createAdmin = async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json({data: admin});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdmin = async (req, res)=>{
    try {
        const {id} = req.params;
        const admin = await Admin.findById(id);
        res.status(200).json({data: admin});
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateAdmin = async (req, res) => {
    try {
        const {id} = req.params;
        const admin = await Admin.findByIdAndUpdate(
            id, 
            req.body, {new: true, runValidators: true}

        );

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const updatedAdmin = await Admin.findById(id);
        res.status(200).json({data: updatedAdmin});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const {id} = req.params;
        const admin = await Admin.findByIdAndDelete(id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdmins,
    createAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin,
};