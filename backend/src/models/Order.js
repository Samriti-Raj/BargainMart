
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      image: String, // Add image field
      description: String, // Add description field
      category: String // Add category field
    }
  ],
  totalAmount: Number,
  shipping: {
    name: String,
    address: String,
    city: String,
    pincode: String,
  },
  payment: { type: String, enum: ["COD", "UPI", "Card"], default: "COD" },
  status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  cancelledAt: { type: Date } // Add cancelled timestamp
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);






