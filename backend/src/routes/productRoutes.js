
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { addProduct, getVendorProducts, updateProduct, deleteProduct, getAllProducts } from "../controllers/productController.js";
import upload from "../middleware/uploadMiddle.js"; // Multer middleware for file uploads

const router = express.Router();

// ----------------------
// Vendor-only Routes
// ----------------------

// Add a new product (vendor must be logged in + role = "vendor")
// Supports uploading up to 5 images for the product

router.post(
  "/",
  protect, // Check if user is authenticated via JWT
  authorizeRoles("vendor"), // Restrict access to vendor role
  upload.array("images", 5), // Handle multiple image uploads (max 5)
  addProduct // Controller function
);

router.get("/", protect, authorizeRoles("vendor"), getVendorProducts);   // Get all products of the logged-in vendor
router.put("/:id", protect, authorizeRoles("vendor"), upload.array("images", 5), updateProduct);  // Update a product by ID (vendor only, supports updating images too)
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);        // Delete a product by ID (vendor only)

// ----------------------
// Public Route
// ----------------------

// Get all products (anyone can access - customers, visitors, etc.)
router.get("/all", getAllProducts);

export default router;
