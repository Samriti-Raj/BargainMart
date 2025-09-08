import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String },
  images: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
