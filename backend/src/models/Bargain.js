// backend/models/Bargain.js
import mongoose from "mongoose";

const bargainSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      sender: { type: String, enum: ["customer", "vendor"], required: true },
      text: String,
      price: Number,
      createdAt: { type: Date, default: Date.now },
    }
  ],
  status: { type: String, enum: ["pending", "accepted", "rejected","ongoing"], default: "pending" },
  finalPrice: Number
}, { timestamps: true });

export default mongoose.model("Bargain", bargainSchema);


