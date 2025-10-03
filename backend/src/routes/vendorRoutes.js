// backend/routes/vendorRoutes.js
import express from "express";
import bcrypt from "bcryptjs";  // Library for hashing & comparing passwords
import jwt from "jsonwebtoken";  // Library for creating and verifying JWT tokens
import Vendor from "../models/Vendor.js";  // Vendor Mongoose model

const router = express.Router();


// ----------------------
// Vendor Login Route
// ----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if vendor exists in the database
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Vendor not found" });

    // 2. Compare entered password with hashed password stored in DB
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    // 3. Generate a JWT token with vendor ID & role ("vendor")
    const token = jwt.sign({ id: vendor._id, role: "vendor" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Send token and role back to client
    res.json({ token, role: "vendor" });
  } catch (err) {
    // If something goes wrong (like DB error), send server error
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

