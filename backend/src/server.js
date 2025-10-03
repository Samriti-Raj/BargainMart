
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bargainRoutes from "./routes/bargainRoutes.js";
import path from "path";

// Load environment variables from .env file
dotenv.config();
const app = express();

// ----------------------
// Middleware
// ----------------------

// Enable CORS to allow requests from specific frontend URLs
app.use(cors({
  origin: [
    'http://localhost:3000',  // React frontend local
    'http://localhost:3001',  // Another local dev port
    'https://bargain-mart-dpct.vercel.app'  // Deployed frontend
  ],
  credentials: true  // Allow sending cookies/authorization headers
}));

// Parse incoming JSON requests automatically
app.use(express.json());

// Serve static files (like uploaded images) from the "uploads" folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Setup API routes
app.use("/api/auth", authRoutes);   // Handles user authentication
app.use("/api/products", productRoutes);   // Handles product-related operations
app.use("/api/orders", orderRoutes);       // Handles order management
app.use("/api/bargains", bargainRoutes);   // Handles bargain/negotiation system

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Backend is working!" });
});


// ----------------------
// MongoDB Connection
// ----------------------
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
     // Specific error handling for authentication failure
    if (error.code === 8000) {
      console.log("Authentication failed - check your credentials in .env file");
    }
    process.exit(1);    // Exit process if DB connection fails
  }
};

// Connect to database
connectDB();

// ----------------------
// Start Express Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






