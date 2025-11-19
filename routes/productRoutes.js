// ✅ wolf-backend/routes/productRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import Product from "../models/product.js"; // ✅ Use lowercase to match your file
// import upload from "../config/cloudinary.js"; // Uncomment if you have Cloudinary setup

const router = express.Router();

// ==================== GET FEATURED PRODUCTS ====================
// ⚠️ IMPORTANT: This MUST be before /:id route
// GET /api/products/featured/latest - Get newest products
router.get("/featured/latest", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message
    });
  }
});

// ==================== GET ALL PRODUCTS ====================
// GET /api/products - Public route
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    // Build query
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    }
    
    const products = await Product.find(query).sort(sortOption);
    
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// ==================== GET PRODUCT BY ID ====================
// GET /api/products/:id - Public route
// ⚠️ This route must be AFTER specific routes like /featured/latest
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// ==================== CREATE PRODUCT (ADMIN) ====================
// POST /api/products - Admin only
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, stock, discount, category, brand, images } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required"
      });
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      stock: stock || 0,
      discount: discount || 0,
      category,
      brand,
      images: images || [],
      user: req.user ? req.user.id : null
    });
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
});

// ==================== UPDATE PRODUCT (ADMIN) ====================
// PUT /api/products/:id - Admin only
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, stock, discount, category, brand, images } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // Update slug if name changed
    if (name && name !== product.name) {
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (discount !== undefined) product.discount = discount;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (images) product.images = images;
    
    await product.save();
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});

// ==================== DELETE PRODUCT (ADMIN) ====================
// DELETE /api/products/:id - Admin only
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
});

export default router;