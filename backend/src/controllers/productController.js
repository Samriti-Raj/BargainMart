import Product from "../models/Product.js";




export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};




export const addProduct = async (req, res) => {
  try {
    // Map uploaded file paths
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = new Product({
      ...req.body,
      vendor: req.user.id,
      images: imagePaths   // ✅ save images
    });
    console.log(req.files); // in addProduct
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user.id },
      { 
        ...req.body,
        ...(imagePaths.length && { images: imagePaths }) // only overwrite if new files uploaded
      },
      { new: true }
    );

    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};







export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user.id });
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("vendor", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



