// backend/routes/oauthRoutes.js
import express from "express";
import passport from "../config/passport.js";
import { googleCallback, appleCallback } from "../controllers/oauthController.js";

const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/signin?error=google_failed`,
    session: false 
  }),
  googleCallback
);

// Apple OAuth Routes (placeholder for future)
router.get("/apple", (req, res) => {
  res.status(501).json({ message: "Apple Sign In coming soon" });
});

router.post("/apple/callback", appleCallback);

export default router;