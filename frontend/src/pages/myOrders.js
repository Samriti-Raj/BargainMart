import React, { useEffect, useState } from "react";
import axios from "axios";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Orders response:", res.data); // Debug log
        setOrders(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Enhanced helper function to get the correct image URL for order items
  const getProductImage = (product) => {
    console.log("Product data for image:", product); // Enhanced debug log
    
    // Check for different possible image properties in order of preference
    if (product.image) {
      // Handle single image property (from populated product data)
      const imageUrl = product.image;
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/')) {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      } else {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      }
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Handle images array
      const imageUrl = product.images[0];
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/')) {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      } else {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      }
    } else if (product.imageUrl) {
      // Handle imageUrl property
      return product.imageUrl.startsWith('http') ? product.imageUrl : `${process.env.REACT_APP_API_URL}${product.imageUrl}`;
    } else if (product.productImage) {
      // Handle productImage property (sometimes used in order data)
      const imageUrl = product.productImage;
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/')) {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      } else {
        return `${process.env.REACT_APP_API_URL}${imageUrl}`;
      }
    }
    
    return null;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment?.toLowerCase()) {
      case 'cod':
        return 'bg-orange-100 text-orange-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'upi':
        return 'bg-green-100 text-green-800';
      case 'wallet':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">Loading your orders...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your order history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">📦</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your purchase history</p>
            </div>
            {orders.length > 0 && (
              <div className="ml-auto">
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full border border-blue-200">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="text-center py-16 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't placed any orders yet. Start shopping to see your orders here and track your purchases.</p>
              <button
                onClick={() => window.location.href = '/product'}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Enhanced Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">📋</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">Total Amount</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Products Section */}
                    <div className="lg:col-span-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🛍️</span>
                        Products ({order.products.length} {order.products.length === 1 ? 'item' : 'items'})
                      </h4>
                      <div className="space-y-4">
                        {order.products.map((item, index) => {
                          // Fixed: Properly extract product data and handle nested structure
                          const product = item.product || item;
                          console.log("Order item structure:", { item, product }); // Enhanced debug log
                          
                          // Fixed: Pass product to getProductImage instead of item
                          const productImage = getProductImage(product);
                          
                          return (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                              {/* Product Image with enhanced error handling */}
                              <div className="flex-shrink-0 relative">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={product.name || 'Product'}
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                                    onError={(e) => {
                                      console.log("Image failed to load:", productImage);
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                    onLoad={() => {
                                      console.log("Image loaded successfully:", productImage);
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-white shadow-md flex items-center justify-center"
                                  style={{ display: productImage ? 'none' : 'flex' }}
                                >
                                  <div className="text-center">
                                    <span className="text-2xl text-gray-400 mb-1 block">📦</span>
                                    <span className="text-gray-400 text-xs font-medium">No Image</span>
                                  </div>
                                </div>
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                  {product.name || 'Product Name Not Available'}
                                </h5>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                    Qty: {item.quantity || 1}
                                  </span>
                                  {/* Show if this was from a bargain */}
                                  {item.bargainId && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                      Bargained Price
                                    </span>
                                  )}
                                </div>
                                {product.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
                                )}
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-xl text-gray-900">
                                  ₹{((item.finalPrice || product.price || 0) * (item.quantity || 1)).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ₹{(item.finalPrice || product.price || 0).toLocaleString()} each
                                </p>
                                {item.finalPrice && item.finalPrice !== product.price && (
                                  <p className="text-xs text-green-600 font-medium mt-1">Negotiated</p>
                                )}
                                <p className="text-xs text-blue-600 font-medium mt-1">Subtotal</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enhanced Order Details Section */}
                    <div className="space-y-6">
                      {/* Enhanced Shipping Information */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>🚚</span>
                          Shipping Address
                        </h4>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <p className="font-bold text-gray-900 text-lg">{order.shipping.name}</p>
                          <p className="text-gray-700 mt-2 leading-relaxed">
                            {order.shipping.address}
                          </p>
                          <p className="text-gray-700">
                            {order.shipping.city}, {order.shipping.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Payment Information */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>💳</span>
                          Payment Method
                        </h4>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(order.payment)}`}>
                            {order.payment === 'cod' ? '💰 Cash on Delivery' : 
                             order.payment === 'card' ? '💳 Credit/Debit Card' :
                             order.payment === 'upi' ? '📱 UPI Payment' :
                             order.payment === 'wallet' ? '👛 Digital Wallet' :
                             order.payment || 'Unknown Method'}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Order Summary */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>📊</span>
                          Order Summary
                        </h4>
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 space-y-3 border border-gray-100">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-gray-900 font-semibold">₹{(order.totalAmount - 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Shipping</span>
                            <span className="text-green-600 font-bold">Free</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Tax & Fees</span>
                            <span className="text-gray-900 font-semibold">₹0</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="text-lg font-bold text-gray-900">Total Amount</span>
                              <span className="text-xl font-bold text-blue-600">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Order Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between items-start sm:items-center">
                    <div className="text-sm text-gray-600">
                      Need help with this order? <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold underline">Contact Support</a>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-gray-300">
                        📍 Track Order
                      </button>
                      {order.status === 'Delivered' && (
                        <button className="text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                          🔄 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default MyOrders;