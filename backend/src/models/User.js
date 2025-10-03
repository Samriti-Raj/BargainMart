import mongoose from "mongoose";

// Define User schema
const userSchema = new mongoose.Schema(
  {
    // Basic details (for all users)
    name: { type: String, required: true },         // User's full name
    email: { type: String, required: true, unique: true }, // Email must be unique
    password: { type: String, required: true },     // Hashed password stored in DB

    // Role field to differentiate between admin, vendor, and customer
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"], // Allowed roles
      default: "customer",                   // Default role if not specified
    },

    // ----------------------
    // Vendor-specific fields
    // ----------------------
    shopName: { type: String },           // Vendor's shop name
    shopDescription: { type: String },    // Short description about shop
    shopAddress: { type: String },        // Physical location of shop
    gstNumber: { type: String },          // Optional GST/tax ID for business
    balance: { type: Number, default: 0 } // Vendor's earnings (wallet balance)
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Export User model to be used in controllers/routes
export default mongoose.model("User", userSchema);
