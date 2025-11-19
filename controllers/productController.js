import Product from "../models/product.js";
import slugify from "slugify"; // Install this package

// ✅ Create a new product with Cloudinary image upload (defensive)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, discount } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // parse imageUrls safely if provided (sent as JSON string from frontend)
    let imageUrls = [];
    if (req.body.imageUrls) {
      try {
        imageUrls = JSON.parse(req.body.imageUrls);
      } catch (e) {
        // If parsing fails, try using as-is if it's already an array-like string
        if (Array.isArray(req.body.imageUrls)) imageUrls = req.body.imageUrls;
        else imageUrls = [];
      }
    }

    // Get uploaded file URLs from Cloudinary/multer (support f.path or f.secure_url)
    const uploadedUrls =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.path || f.secure_url || f.url).filter(Boolean)
        : [];

    // Combine both URL types
    const images = [...(Array.isArray(imageUrls) ? imageUrls : []), ...uploadedUrls];

    // create slug and avoid duplicates
    let slug = slugify(name, { lower: true, strict: true });
    const exists = await Product.findOne({ slug });
    if (exists) {
      slug = `${slug}-${Date.now()}`; // simple uniquifier
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price || 0),
      discount: Number(discount || 0),  
     
      category,
      images,
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    // if duplicate key we can return 409
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product with same slug already exists",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Always wrap inside an object with "product" key
    res.status(200).json({ product });
  } catch (error) {
    console.error("❌ getProductById Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ Ensure stock is a number (avoid string errors from frontend)
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true, // returns updated product
      runValidators: true, // validate before update
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};


// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};