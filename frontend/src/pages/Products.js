// src/pages/Products.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Products = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/all`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error("Failed to load products");
      });
  }, []);

  const addToCart = (product) => {
    if (role !== "customer") {
      toast.warning("Only customers can add items to cart");
      return;
    }
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      toast.info(`${product.name} is already in your cart`);
      return;
    }
    
    setCart([...cart, product]);
    toast.success(`${product.name} added to cart`);
  };

  const handleBargain = (product) => {
    if (role !== "customer") {
      toast.warning("Only customers can bargain");
      return;
    }
    
    navigate("/bargain", {
      state: { productId: product._id, vendorId: product.vendor },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
          <p className="text-gray-600">
            {role === "customer" 
              ? "Browse and add products to your cart, or start bargaining for better prices!"
              : role === "vendor" 
              ? "Browse products from other vendors"
              : "Explore our product catalog"}
          </p>
          {role === "customer" && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                💡 <strong>Tip:</strong> You can bargain with vendors for better prices using our chat system!
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md h-96 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2"></div>
                  <div className="bg-gray-300 h-6 rounded mb-4"></div>
                  <div className="bg-gray-300 h-8 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border hover:border-blue-300 flex flex-col min-h-[520px]">
                <div className="relative group">
                  {/* Fixed size container for images */}
                  <div className="w-full h-96 bg-gray-100 overflow-hidden">
                    <img 
                      src={
                        product.images?.length
                          ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`
                          : "/api/placeholder/300/200"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/300/200";
                        e.target.className = "w-full h-full object-contain bg-gray-200 flex items-center justify-center";
                      }}
                    />
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium shadow-md">
                    Stock: {product.stock}
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Low Stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10 overflow-hidden" title={product.description}>
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      by {product.vendor?.name || 'Vendor'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {role === "customer" ? (
                    <div className="space-y-2">
                      <button
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          product.stock > 0 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                      
                      <button
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          product.stock > 0 
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleBargain(product)}
                        disabled={product.stock === 0}
                      >
                        💬 Bargain Price
                      </button>
                    </div>
                  ) : role === "vendor" ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-700 text-center">
                        🏪 Vendor View - Cannot purchase
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 text-center">
                        Please login to shop
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Products Available</h3>
            <p className="text-gray-500 mb-6">Check back later for new products from our vendors!</p>
            {role === "vendor" && (
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your Products
              </button>
            )}
          </div>
        )}

        {/* Cart Summary for Customers */}
        {role === "customer" && cart.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Cart Summary</h3>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {cart.length} items
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Total: ₹{cart.reduce((total, item) => total + item.price, 0)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate("/checkout")}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        {/* Custom CSS for consistent layout */}
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Products;