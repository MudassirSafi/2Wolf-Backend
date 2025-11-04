import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret_dev_change_this";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, authorization denied." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No user info." });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden." });
  next();
};
