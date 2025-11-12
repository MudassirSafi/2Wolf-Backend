import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import { createDefaultAdmin } from "./utils/createAdmin.js"; // ✅ Import admin creator

// ✅ Load environment variables
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
    
    // ✅ Create default admin user
    await createDefaultAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Debug route to check database connection
app.get("/api/debug/db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const adminCount = await mongoose.connection.db.collection('users').countDocuments({ role: 'admin' });
    
    res.json({ 
      status: "Connected",
      database: mongoose.connection.name,
      collections: collections.map(c => c.name),
      totalUsers: userCount,
      adminUsers: adminCount
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error",
      error: error.message 
    });
  }
});

// ✅ Routes
app.use("/api/users", authRoutes);
app.use("/api/auth", oauthRoutes);

// ✅ Health check route
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

// ✅ Global error handler
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
  console.log(`📊 Debug endpoint: http://localhost:${PORT}/api/debug/db`);
});