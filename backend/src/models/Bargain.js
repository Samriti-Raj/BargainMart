import mongoose from "mongoose";

// Define Bargain schema
const bargainSchema = new mongoose.Schema(
  {
    // Reference to the product being bargained for
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    // Reference to the customer involved in the bargain
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Reference to the vendor involved in the bargain
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Chat messages exchanged between customer and vendor
    messages: [
      {
        sender: { type: String, enum: ["customer", "vendor"], required: true }, // Who sent the message
        text: String,       // Optional message text
        price: Number,      // Optional price offered
        createdAt: { type: Date, default: Date.now } // Timestamp of message
      }
    ],

    // Status of the bargain
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected", "ongoing"], 
      default: "pending" 
    },

    // Final agreed price if bargain is accepted
    finalPrice: Number
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt for the document
);

// Export Bargain model to use in controllers/routes
export default mongoose.model("Bargain", bargainSchema);


