// wolf-backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ← ADD THIS IMPORT

const JWT_SECRET = process.env.JWT_SECRET || "MuhibAfridi2WolfSecretKey";

export const protect = async (req, res, next) => {  // ← Make it async
  const authHeader = req.headers.authorization;
  
  console.log('🔐 Authorization header:', authHeader); // Debug log
  
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', decoded); // Debug log
    
    // ⭐ FETCH THE FULL USER FROM DATABASE
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    
    req.user = user; // ← Now req.user has _id, email, name, role, etc.
    console.log('✅ User authenticated:', user.email); // Debug log
    
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message); // Debug log
    return res.status(401).json({ message: "Token invalid." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No user info." });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden." });
  next();
};