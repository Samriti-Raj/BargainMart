
import express from "express";
import { register, login } from "../controllers/authController.js"; // Auth controller functions
import { protect, authorizeRoles } from "../middleware/authMiddleware.js"; // JWT + Role middleware

const router = express.Router();

// ----------------------
// Public Routes (no auth needed)
// ----------------------

// Register a new user (customer/vendor/admin depending on role)
router.post("/register", register);

// Login an existing user (returns JWT token)
router.post("/login", login);

// ----------------------
// Protected Routes (need JWT + role-based access)
// ----------------------

// Only accessible to users with role = "customer"
router.get("/customer", protect, authorizeRoles("customer"), (req, res) => {
  res.json({ msg: "Welcome, Customer!" });
});

// Only accessible to users with role = "vendor"
router.get("/vendor", protect, authorizeRoles("vendor"), (req, res) => {
  res.json({ msg: "Welcome, Vendor!" });
});

// Only accessible to users with role = "admin"
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ msg: "Welcome, Admin!" });
});

export default router;
