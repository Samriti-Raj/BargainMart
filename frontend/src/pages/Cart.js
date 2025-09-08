
import React from "react";
import { useNavigate } from "react-router-dom";

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  // Helper function to get the correct image URL
  const getProductImage = (item) => {
    // Check for different possible image properties
    if (item.images && item.images.length > 0) {
      // Handle images array (most likely case based on your Home component)
      const imageUrl = item.images[0];
      return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
    } else if (item.image) {
      // Handle single image property
      return item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
    } else if (item.imageUrl) {
      // Handle imageUrl property
      return item.imageUrl;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🛒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            {cart.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {cart.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🛒</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
                  <button
                    onClick={() => navigate("/product")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h2>
                  </div>
                  
                  {cart.map((item, index) => {
                    const productImage = getProductImage(item);
                    
                    return (
                      <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center ${productImage ? 'hidden' : 'flex'}`}
                            >
                              <div className="text-center">
                                <span className="text-2xl text-gray-400 mb-1 block">📦</span>
                                <span className="text-gray-400 text-xs font-medium">No Image</span>
                              </div>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">Item #{index + 1}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.category && (
                                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                  {item.category}
                                </span>
                              )}
                              {item.vendor && (
                                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                  By: {item.vendor.name || item.vendor}
                                </span>
                              )}
                              {item.stock !== undefined && (
                                <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                                  item.stock > 0 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Price and Remove Button */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">Price</p>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-bold text-xl group"
                              title="Remove item"
                            >
                              <span className="group-hover:scale-110 transition-transform duration-200 inline-block">×</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({cart.reduce((acc, item) => acc + (item.quantity || 1), 0)} items)
                    </span>
                    <span className="text-gray-900 font-medium">₹{total.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">₹0</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Cart Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">🎯</span>
                    <span className="text-sm font-medium text-blue-800">Smart Shopping Tip</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    You can negotiate prices with vendors using our bargaining feature before checkout!
                  </p>
                </div>

                {/* Checkout Button or Message */}
                {role === "customer" ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span className="text-lg">💳</span>
                      Proceed to Checkout
                    </button>
                    
                    <button
                      onClick={() => navigate("/product")}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold text-lg">!</span>
                    </div>
                    <p className="text-red-800 font-medium text-sm mb-2">
                      {role === "vendor"
                        ? "Vendors cannot proceed to checkout"
                        : "Please login as a customer to checkout"}
                    </p>
                    {!role && (
                      <button
                        onClick={() => navigate("/login")}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Login Here
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for line-clamp-2 */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Cart;