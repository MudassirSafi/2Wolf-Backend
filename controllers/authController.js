import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_dev_change_this";

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  try {
    console.log("SIGNUP BODY:", req.body);
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: "Email already in use." });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashed,
      role: "user",
    });

    await user.save();

    const token = createToken(user);

    return res.status(201).json({ token, role: user.role, message: "User created." });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const signin = async (req, res) => {
  try {
    console.log("SIGNIN BODY:", req.body);
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("signin: user not found for:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Handle two cases:
    // 1) stored password is bcrypt hash (starts with $2)
    // 2) legacy plain-text (attempt direct compare and rehash on success)
    let isMatch = false;
    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // legacy plain text fallback (migrate on successful match)
      if (password === user.password) {
        isMatch = true;
        // re-hash and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        console.log("signin: migrated plain password to hash for:", normalizedEmail);
      }
    }

    if (!isMatch) {
      console.log("signin: password mismatch for:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = createToken(user);

    return res.status(200).json({
      token,
      role: user.role,
      message: "Signed in successfully.",
    });
  } catch (err) {
    console.error("signin error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
