
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Bargain from "../models/Bargain.js";

const router = express.Router();

// Start a bargain
router.post("/start", protect, async (req, res) => {
  const { productId, vendorId, price } = req.body;
  try {
    const bargain = await Bargain.create({
      product: productId,
      customer: req.user.id,
      vendor: vendorId,
      messages: [{ sender: "customer", text: "Proposed a price", price }],
      status: "ongoing",
    });
    res.json(bargain);
  } catch (err) {
    console.error("Error starting bargain:", err);
    res.status(500).json({ msg: "Error starting bargain" });
  }
});

// Add a message (customer or vendor)
router.post("/:id/message", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) {
      return res.status(404).json({ msg: "Bargain not found" });
    }

    const sender = req.user.role === "vendor" ? "vendor" : "customer";
    const { text, price } = req.body;

    bargain.messages.push({ sender, text, price });
    await bargain.save();
    res.json(bargain);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ msg: "Error sending message" });
  }
});



// Get all bargains for a vendor
router.get("/vendor", protect, async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ msg: "Only vendors can view their bargains" });
    }

    const bargains = await Bargain.find({ vendor: req.user.id })
      .populate("product", "name price")
      .populate("customer", "name email");

    res.json(bargains);
  } catch (err) {
    console.error("Error fetching vendor bargains:", err);
    res.status(500).json({ msg: "Error fetching vendor bargains" });
  }
});



// Vendor rejects bargain
router.post("/:id/reject", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) {
      return res.status(404).json({ msg: "Bargain not found" });
    }

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


// Get all bargains for a customer
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




// Customer rejects bargain
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


// Customer makes counter-offer
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


// Delete a bargain (customer or vendor can delete)
router.delete("/:id", protect, async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);

    if (!bargain) {
      return res.status(404).json({ msg: "Bargain not found" });
    }

    // Only the customer who created it OR the vendor involved can delete
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

// Vendor or customer accepts bargain
router.post("/:id/accept", protect, async (req, res) => {
  try {
    let bargain = await Bargain.findById(req.params.id);

    if (!bargain) {
      return res.status(404).json({ msg: "Bargain not found" });
    }

    if (req.user.role !== "vendor" && req.user.role !== "customer") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const finalPrice =
      req.body.price || bargain.messages[bargain.messages.length - 1]?.price;

    if (!finalPrice) {
      return res.status(400).json({ msg: "Final price is required" });
    }

    bargain.status = "accepted";
    bargain.finalPrice = finalPrice;
    await bargain.save();
    

    // ✅ repopulate before sending response so frontend has product & customer details
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

// Customer accepts bargain explicitly
router.post("/:id/customer-accept", protect, async (req, res) => {
  try {
    let bargain = await Bargain.findById(req.params.id);

    if (!bargain) return res.status(404).json({ msg: "Bargain not found" });

    if (req.user.role !== "customer") {
      return res.status(403).json({ msg: "Only customers can accept bargains" });
    }

    const finalPrice =
      req.body.price || bargain.messages[bargain.messages.length - 1]?.price;

    if (!finalPrice) {
      return res.status(400).json({ msg: "Final price is required" });
    }

    bargain.status = "accepted";
    bargain.finalPrice = finalPrice;
    await bargain.save();

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
