// ✅ wolf-backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js"; // ✅ Import product routes
import { createDefaultAdmin } from "./utils/createAdmin.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

// ✅ Initialize Passport
app.use(passport.initialize());

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/WolfDB";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    console.log("📁 Database name:", mongoose.connection.name);
    console.log("🔗 Database host:", mongoose.connection.host);
    
    await createDefaultAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/users", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes); // ✅ Product routes

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "2Wolf Backend API is running!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});