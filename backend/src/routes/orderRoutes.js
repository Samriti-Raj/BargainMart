
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getVendorOrders,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// ----------------------
// Order Routes
// ----------------------

// 1. Place a new order (customer must be logged in)
router.post(
  "/",
  protect,       // JWT authentication required
  createOrder    // Controller: handles creating a new order
);

// 2. Get all orders of the logged-in user
router.get(
  "/",
  protect,       // Only logged-in users can view their own orders
  getUserOrders
);

// 3. Get all orders related to vendor’s products (vendor only)
router.get(
  "/vendor",
  protect,                // User must be logged in
  authorizeRoles("vendor"), // Only users with "vendor" role
  getVendorOrders
);

// 4. Cancel an order by ID (customer must be logged in)
// Uses PATCH because we are updating order status instead of deleting it
router.patch(
  "/:orderId/cancel",
  protect,        // Only logged-in users can cancel
  cancelOrder     // Controller: updates order status to "cancelled"
);

export default router;
