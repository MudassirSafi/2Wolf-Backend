// backend/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// ✅ Only configure Google OAuth if credentials are provided
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log("✅ Google OAuth configured");
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails[0].value.toLowerCase();
          const name = profile.displayName || profile.name?.givenName || "User";
          const googleId = profile.id;

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // User exists, update Google ID if not set
            if (!user.googleId) {
              user.googleId = googleId;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user with random secure password
          const randomPassword = `google_${googleId}_${Date.now()}_${Math.random()}`;
          
          user = new User({
            name,
            email,
            googleId,
            password: randomPassword, // OAuth users don't use password login
            role: "user",
          });

          await user.save();
          console.log("✅ New user created via Google OAuth:", email);
          return done(null, user);
        } catch (error) {
          console.error("❌ Google Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log("⚠️  Google OAuth NOT configured - Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env");
}

// Serialize and deserialize user (required by passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;