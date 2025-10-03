import mongoose from "mongoose";

// Define Product schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // Product name (required)
    description: { type: String },                 // Optional description of the product
    price: { type: Number, required: true },      // Product price (required)
    stock: { type: Number, default: 0 },          // Available stock (default = 0)
    
    // Reference to the vendor (User model)
    vendor: { 
      type: mongoose.Schema.Types.ObjectId,       // MongoDB ObjectId
      ref: "User",                                // Reference to 'User' collection
      required: true 
    },

    category: { type: String },                   // Optional category
    images: [{ type: String }]                    // Array of image URLs/paths
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

// Export Product model to use in controllers/routes
export default mongoose.model("Product", productSchema);
