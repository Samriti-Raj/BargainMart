import Product from "../models/Product.js";

// ----------------------
// Get all products of logged-in vendor
// ----------------------
export const getVendorProducts = async (req, res) => {
  try {
    // Find products where vendor matches logged-in user
    const products = await Product.find({ vendor: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Add a new product (vendor only)
// ----------------------
export const addProduct = async (req, res) => {
  try {
    // Map uploaded files to /uploads/ path
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = new Product({
      ...req.body,           // spread product details from request body
      vendor: req.user.id,   // link product to logged-in vendor
      images: imagePaths     // save uploaded images
    });

    console.log(req.files); // Debug: log uploaded files
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Update an existing product (vendor only)
// ----------------------
export const updateProduct = async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user.id }, // ensure vendor owns the product
      { 
        ...req.body, 
        ...(imagePaths.length && { images: imagePaths }) // overwrite images only if new ones uploaded
      },
      { new: true } // return updated product
    );

    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Delete a product (vendor only)
// ----------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Get all products (public route)
// ----------------------
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "name email"); // include vendor info
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};




