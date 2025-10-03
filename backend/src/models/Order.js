import mongoose from "mongoose";

// Define Order schema
const orderSchema = new mongoose.Schema(
  {
    // Reference to the user who placed the order
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // List of products in the order
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Reference to product
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },     // Reference to vendor
        name: String,        // Snapshot of product name
        price: Number,       // Snapshot of product price
        quantity: { type: Number, default: 1 }, // Quantity ordered
        image: String,       // Snapshot of product image
        description: String, // Snapshot of product description
        category: String     // Snapshot of product category
      }
    ],

    totalAmount: Number, // Total price of the order

    // Shipping information
    shipping: {
      name: String,
      address: String,
      city: String,
      pincode: String
    },

    // Payment method
    payment: { type: String, enum: ["COD", "UPI", "Card"], default: "COD" },

    // Order status
    status: { 
      type: String, 
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"], 
      default: "Pending" 
    },

    cancelledAt: { type: Date } // Timestamp when order was cancelled
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Export Order model
export default mongoose.model("Order", orderSchema);






