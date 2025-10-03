import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // Middleware to ensure user is logged in (JWT verified)
import Bargain from "../models/Bargain.js"; // Bargain Mongoose model

const router = express.Router();

// ----------------------
// Start a new bargain (customer initiates)
// ----------------------
router.post("/start", protect, async (req, res) => {
  const { productId, vendorId, price } = req.body;
  try {
    const bargain = await Bargain.create({
      product: productId,
      customer: req.user.id, // logged-in customer
      vendor: vendorId,
      messages: [{ sender: "customer", text: "Proposed a price", price }], // first offer
      status: "ongoing",
    });
    res.json(bargain);
  } catch (err) {
    console.error("Error starting bargain:", err);
    res.status(500).json({ msg: "Error starting bargain" });
  }
});

// ----------------------
// Add a new message to a bargain (either customer or vendor)
// ----------------------
router.post("/:id/message", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    // Determine sender role based on logged-in user
    const sender = req.user.role === "vendor" ? "vendor" : "customer";
    const { text, price } = req.body;

    // Push new message to messages array
    bargain.messages.push({ sender, text, price });
    await bargain.save();

    res.json(bargain);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ msg: "Error sending message" });
  }
});

// ----------------------
// Vendor: Get all bargains related to them
// ----------------------
router.get("/vendor", protect, async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ msg: "Only vendors can view their bargains" });
    }

    const bargains = await Bargain.find({ vendor: req.user.id })
      .populate("product", "name price")   // include product name & price
      .populate("customer", "name email"); // include customer details

    res.json(bargains);
  } catch (err) {
    console.error("Error fetching vendor bargains:", err);
    res.status(500).json({ msg: "Error fetching vendor bargains" });
  }
});

// ----------------------
// Vendor rejects a bargain
// ----------------------
router.post("/:id/reject", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    if (req.user.role !== "vendor") {
      return res.status(403).json({ msg: "Only vendors can reject bargains" });
    }

    bargain.status = "rejected";
    await bargain.save();
    res.json(bargain);
  } catch (err) {
    console.error("Error rejecting bargain:", err);
    res.status(500).json({ msg: "Error rejecting bargain" });
  }
});

// ----------------------
// Customer: Get all bargains they are involved in
// ----------------------
router.get("/customer", protect, async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ msg: "Only customers can view their bargains" });
    }

    const bargains = await Bargain.find({ customer: req.user.id })
      .populate("product", "name price")
      .populate("vendor", "name email");

    res.json(bargains);
  } catch (err) {
    console.error("Error fetching customer bargains:", err);
    res.status(500).json({ msg: "Error fetching customer bargains" });
  }
});

// ----------------------
// Customer rejects bargain
// ----------------------
router.post("/:id/customer-reject", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    if (req.user.role !== "customer") {
      return res.status(403).json({ msg: "Only customers can reject bargains" });
    }

    bargain.status = "rejected";
    await bargain.save();
    res.json(bargain);
  } catch (err) {
    console.error("Error rejecting bargain:", err);
    res.status(500).json({ msg: "Error rejecting bargain" });
  }
});

// ----------------------
// Customer makes a counter-offer
// ----------------------
router.post("/:id/counter", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    if (req.user.role !== "customer") {
      return res.status(403).json({ msg: "Only customers can counter-offer" });
    }

    const { price } = req.body;
    bargain.messages.push({ sender: "customer", text: "Counter Offer", price });
    await bargain.save();

    res.json(bargain);
  } catch (err) {
    console.error("Error sending counter offer:", err);
    res.status(500).json({ msg: "Error sending counter offer" });
  }
});

// ----------------------
// Delete a bargain (either vendor or customer involved)
// ----------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    // Ensure only the vendor or customer who is part of the bargain can delete it
    if (
      bargain.customer.toString() !== req.user.id &&
      bargain.vendor.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Not authorized to delete this bargain" });
    }

    await bargain.deleteOne();
    res.json({ msg: "Bargain deleted successfully" });
  } catch (err) {
    console.error("Error deleting bargain:", err);
    res.status(500).json({ msg: "Error deleting bargain" });
  }
});

// ----------------------
// Vendor OR Customer accepts bargain
// ----------------------
router.post("/:id/accept", protect, async (req, res) => {
  try {
    let bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    // Only vendor or customer can accept
    if (req.user.role !== "vendor" && req.user.role !== "customer") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Final agreed price is either provided or last offered price
    const finalPrice =
      req.body.price || bargain.messages[bargain.messages.length - 1]?.price;

    if (!finalPrice) return res.status(400).json({ msg: "Final price is required" });

    bargain.status = "accepted";
    bargain.finalPrice = finalPrice;
    await bargain.save();

    // Repopulate relations before sending to frontend
    bargain = await Bargain.findById(req.params.id)
      .populate("product", "name price")
      .populate("customer", "name email")
      .populate("vendor", "name email");

    res.json(bargain);
  } catch (err) {
    console.error("Error accepting bargain:", err);
    res.status(500).json({ msg: "Error accepting bargain" });
  }
});

// ----------------------
// Customer explicitly accepts bargain
// ----------------------
router.post("/:id/customer-accept", protect, async (req, res) => {
  try {
    let bargain = await Bargain.findById(req.params.id);
    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    if (req.user.role !== "customer") {
      return res.status(403).json({ msg: "Only customers can accept bargains" });
    }

    const finalPrice =
      req.body.price || bargain.messages[bargain.messages.length - 1]?.price;

    if (!finalPrice) return res.status(400).json({ msg: "Final price is required" });

    bargain.status = "accepted";
    bargain.finalPrice = finalPrice;
    await bargain.save();

    // Repopulate with product and vendor details for frontend
    bargain = await Bargain.findById(req.params.id)
      .populate("product", "name price")
      .populate("vendor", "name email");

    res.json(bargain);
  } catch (err) {
    console.error("Error accepting bargain:", err);
    res.status(500).json({ msg: "Error accepting bargain" });
  }
});

export default router;
