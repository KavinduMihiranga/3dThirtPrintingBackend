const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  upload
} = require('../controller/product.controller');

// Routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Use `upload.single('image')` for file upload
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);

router.delete('/:id', deleteProduct);

module.exports = router;
