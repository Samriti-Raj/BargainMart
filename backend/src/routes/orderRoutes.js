
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createOrder, getUserOrders, getVendorOrders, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder); // place order
router.get("/", protect, getUserOrders); // view user orders
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorOrders);
router.patch("/:orderId/cancel", protect, cancelOrder); // cancel order - NEW ROUTE

export default router;