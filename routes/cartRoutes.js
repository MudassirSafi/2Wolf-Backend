// backend/Routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const User = require("../Models/User");
const Product = require("../Models/product");

// 🛒 Get user cart
router.get("/:userId/cart", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ cart: user.cart || [] });
  } catch (err) {
    console.error("Cart GET error:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// 🛒 Add or update product in cart
router.post("/:userId/cart", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // find product in user cart
    const existing = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      existing.quantity += quantity;
      if (existing.quantity <= 0) {
        user.cart = user.cart.filter(
          (item) => item.product.toString() !== productId
        );
      }
    } else if (quantity > 0) {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product");
    res.json({ cart: populatedUser.cart });
  } catch (err) {
    console.error("Cart POST error:", err);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// 🗑 Remove specific item
router.delete("/:userId/cart/:productId", protect, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product");
    res.json({ cart: populatedUser.cart });
  } catch (err) {
    console.error("Cart DELETE error:", err);
    res.status(500).json({ message: "Error removing item" });
  }
});

// 🧹 Clear entire cart
router.delete("/:userId/cart", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = [];
    await user.save();

    res.json({ cart: [] });
  } catch (err) {
    console.error("Cart clear error:", err);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;
