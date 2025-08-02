const Product = require('../models/product.model');
const multer = require("multer");
const path = require("path");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure "uploads/" directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 123456.jpg
  },
});

const upload = multer({ storage });

// Get all products
const getProducts = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product (with image)
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, qty, status } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const product = await Product.create({
      name,
      category,
      description,
      price,
      qty,
      status,
      image: imagePath,
    });

    res.status(201).json({ data: product });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product (with optional image)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  upload, // exported for use in routes
};
