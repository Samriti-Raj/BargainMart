
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bargainRoutes from "./routes/bargainRoutes.js";
import path from "path";

dotenv.config();
const app = express();

// Middlewares

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://bargain-mart-dpct.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bargains", bargainRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// MongoDB Connection (Fixed)
const connectDB = async () => {
  try {
    // Changed MONGO_URI to MONGODB_URI and removed deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    if (error.code === 8000) {
      console.log("🔧 Authentication failed - check your credentials in .env file");
    }
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});






