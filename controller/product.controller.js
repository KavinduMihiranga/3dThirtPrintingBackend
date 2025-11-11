const Product = require('../models/product.model');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // e.g. 1728391029384.jpg
  },
});

const upload = multer({ storage });

// ✅ Helper: Generate full public image path
const getImagePath = (filename) => {
  if (!filename) return null;
  return `/api/uploads/${filename}`;
};

// ✅ GET all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const productsWithImagePath = products.map((prod) => {
      const prodObj = prod.toObject();
      prodObj.image = getImagePath(prodObj.image);
      prodObj.title = prodObj.title || prodObj.name; // ensure title consistency
      return prodObj;
    });

    res.status(200).json({ data: productsWithImagePath });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// ✅ CREATE product (with image upload)
const createProduct = async (req, res) => {
  try {
    const { name, category, size, description, price, qty, status } = req.body;
    const imageFilename = req.file ? req.file.filename : null;

    const product = await Product.create({
      name,
      category,
      size,
      description,
      price,
      qty,
      status,
      image: imageFilename,
    });

    const productObj = product.toObject();
    productObj.image = getImagePath(productObj.image);
    productObj.title = productObj.title || productObj.name;

    res.status(201).json({ message: "Product created successfully", data: productObj });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

// ✅ GET a single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productObj = product.toObject();
    productObj.image = getImagePath(productObj.image);
    productObj.title = productObj.title || productObj.name;

    res.status(200).json({ data: productObj });
  } catch (error) {
    console.error("Error in getProduct:", error);
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// ✅ UPDATE product (with optional new image)
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

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productObj = product.toObject();
    productObj.image = getImagePath(productObj.image);
    productObj.title = productObj.title || productObj.name;

    res.status(200).json({ message: "Product updated successfully", data: productObj });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

// ✅ DELETE product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optionally remove image from uploads folder
    if (product.image) {
      const imagePath = path.join(__dirname, `../uploads/${product.image}`);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Failed to delete image:", err.message);
      });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  upload, // exported for use in routes
};
