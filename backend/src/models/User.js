

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },

    // ✅ Vendor-specific fields (only used if role = "vendor")
    shopName: { type: String },
    shopDescription: { type: String },
    shopAddress: { type: String },
    gstNumber: { type: String }, // optional tax ID
    balance: { type: Number, default: 0 }, // vendor earnings
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
