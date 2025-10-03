import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ----------------------
// Middleware: Protect Routes (JWT Authentication)
// ----------------------
export const protect = async (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token using secret key from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    // Attach user object to request for use in controllers/routes
    req.user = user;
    next(); // proceed to next middleware or route handler
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// ----------------------
// Middleware: Authorize Specific Roles
// ----------------------
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if logged-in user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" }); // Forbidden
    }
    next(); // Role allowed → continue
  };
};
