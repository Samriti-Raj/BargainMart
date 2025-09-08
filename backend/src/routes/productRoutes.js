
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { addProduct, getVendorProducts, updateProduct, deleteProduct, getAllProducts } from "../controllers/productController.js";
import upload from "../middleware/uploadMiddle.js"; // 👈 import multer middleware

const router = express.Router();

// Vendor-only routes
router.post("/", protect, authorizeRoles("vendor"), upload.array("images", 5), addProduct);
router.get("/", protect, authorizeRoles("vendor"), getVendorProducts);
router.put("/:id", protect, authorizeRoles("vendor"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

// Public route
router.get("/all", getAllProducts);

export default router;
