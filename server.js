import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // change to specific origin in production
  })
);

// routes
app.use("/api/users", authRoutes);

// simple health check
app.get("/", (req, res) => res.send({ ok: true, date: new Date() }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected.");

    // create admin if not exists
    const adminEmail = "2wolf@gmail.com";
    const adminPassword = "2Wolfdubai";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(adminPassword, salt);
      const adminUser = new User({
        name: "Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });
      await adminUser.save();
      console.log("✅ Default admin created:", adminEmail);
    } else {
      console.log("ℹ️ Admin already exists:", adminEmail);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Start error:", err);
    process.exit(1);
  }
}

start();
