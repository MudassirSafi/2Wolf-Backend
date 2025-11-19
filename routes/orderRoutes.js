// ✅ wolf-backend/routes/orderRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/product.js";

const router = express.Router();

// ==================== CREATE STRIPE CHECKOUT SESSION ====================
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    console.log('🔐 User authenticated:', req.user);
    console.log('📦 Request body:', req.body);

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No items provided" 
      });
    }

    // Check Stripe key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("❌ Stripe secret key is missing!");
      return res.status(500).json({ 
        success: false, 
        message: "Payment system not configured. Please contact support." 
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Prepare line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || `Product ${item.productId}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    console.log('💳 Creating Stripe session with items:', lineItems);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`,
      customer_email: req.user.email,
      metadata: { 
        userId: req.user._id.toString(),
        userName: req.user.name
      }
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url // This is the key part - return the URL!
    });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating checkout session", 
      error: error.message 
    });
  }
});

// ==================== STRIPE WEBHOOK (for payment confirmation) ====================
router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Webhook secret not configured");
    return res.sendStatus(400);
  }

  let event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('💰 Payment successful for session:', session.id);
    console.log('👤 Customer:', session.customer_email);
    
    // TODO: Create order in database with payment confirmed
    // You can get userId from session.metadata.userId
  }

  res.json({ received: true });
});

// ==================== CREATE ORDER (After payment or for COD) ====================
router.post("/", protect, async (req, res) => {
  try {
    const { products, address, paymentMethod, paymentStatus, stripeSessionId } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products provided" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    let total = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product not found: ${item.productId}` 
        });
      }

      const qty = Number(item.quantity || 0);
      if (qty <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid quantity for ${product.name}` 
        });
      }
      if (qty > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough stock for ${product.name}` 
        });
      }

      total += product.price * qty;
      orderItems.push({ 
        productId: product._id, 
        quantity: qty, 
        price: product.price 
      });

      // Update product stock
      product.stock -= qty;
      await product.save();
    }

    const newOrder = await Order.create({
      user: req.user._id,
      products: orderItems,
      total,
      address,
      paymentMethod: paymentMethod || 'Stripe',
      paymentStatus: paymentStatus || 'Paid',
      status: 'Pending',
      stripeSessionId
    });

    res.status(201).json({ 
      success: true, 
      message: "Order created successfully", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order", 
      error: error.message 
    });
  }
});

// ==================== GET USER ORDERS ====================
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.productId", "name price images")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: error.message 
    });
  }
});

// ==================== GET ORDER BY ID ====================
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.productId", "name price images");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching order", 
      error: error.message 
    });
  }
});

// ==================== ADMIN: GET ALL ORDERS ====================
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders", 
      error: error.message 
    });
  }
});

// ==================== ADMIN: UPDATE ORDER ====================
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();

    res.json({ success: true, message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating order", 
      error: error.message 
    });
  }
});

// ==================== ADMIN: DELETE ORDER ====================
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error deleting order", 
      error: error.message 
    });
  }
});

export default router;