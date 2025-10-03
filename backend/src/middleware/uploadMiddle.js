import multer from "multer";
import path from "path";
import fs from "fs";

// ----------------------
// Ensure uploads directory exists
// ----------------------
const uploadDir = path.join(process.cwd(), "uploads"); // uploads folder in project root
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create uploads folder if it doesn't exist
}

// ----------------------
// Configure Multer storage
// ----------------------
const storage = multer.diskStorage({
  // Destination folder for uploaded files
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  
  // Filename format: timestamp + original file extension
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// ----------------------
// Initialize upload middleware
// ----------------------
const upload = multer({ storage });

// Export upload to use in routes for handling file uploads
export default upload;


