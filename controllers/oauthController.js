// backend/controllers/oauthController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_dev_change_this";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

// Google OAuth Callback
export const googleCallback = async (req, res) => {
  try {
    // User is already attached to req.user by passport
    const user = req.user;
    const token = createToken(user);
    
    // Redirect to frontend with token and role
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
  }
};

// Apple OAuth Callback
export const appleCallback = async (req, res) => {
  try {
    // User is already attached to req.user by passport
    const user = req.user;
    const token = createToken(user);
    
    // Redirect to frontend with token and role
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    console.error("Apple OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
  }
};