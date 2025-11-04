const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../Controllers/productController.js");
const upload = require("../config/cloudinary.js");

const router = express.Router();

// Routes
router.post("/",upload.array("images", 5), createProduct);          // Add product
router.get("/", getAllProducts);          // Get all products
router.get("/:id", getProductById);       // Get product by ID
router.put("/:id", updateProduct);        // Update product
router.delete("/:id", deleteProduct);     // Delete product

module.exports = router;
