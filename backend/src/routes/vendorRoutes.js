// backend/routes/vendorRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Vendor not found" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    const token = jwt.sign({ id: vendor._id, role: "vendor" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, role: "vendor" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

