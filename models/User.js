import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    googleId: { type: String, unique: true, sparse: true }, // ✅ Google OAuth ID
    appleId: { type: String, unique: true, sparse: true },  // ✅ Apple OAuth ID
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);