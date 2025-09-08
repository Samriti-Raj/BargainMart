

import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Testing routes
router.get("/customer", protect, authorizeRoles("customer"), (req, res) => {
  res.json({ msg: "Welcome, Customer!" });
});

router.get("/vendor", protect, authorizeRoles("vendor"), (req, res) => {
  res.json({ msg: "Welcome, Vendor!" });
});

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ msg: "Welcome, Admin!" });
});

export default router;
