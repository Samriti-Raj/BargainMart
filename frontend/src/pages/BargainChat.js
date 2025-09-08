

// src/pages/BargainChat.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const BargainChat = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserRole = localStorage.getItem("role");
  const messagesEndRef = useRef(null);

  // State management
  const [messages, setMessages] = useState([]);
  const [price, setPrice] = useState("");
  const [product, setProduct] = useState(null);
  const [bargainId, setBargainId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced error handling
  const handleApiError = (err, defaultMessage) => {
    console.error("API Error:", err);
    
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/auth");
      return;
    }
    
    if (err.response?.status === 403) {
      alert("You don't have permission to perform this action.");
      return;
    }
    
    if (err.response?.status === 404) {
      alert("Resource not found. The product or bargain may have been deleted.");
      navigate("/products");
      return;
    }
    
    // Handle HTML error responses from server
    if (err.response?.data && typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
      alert("Server error occurred. Please try again later.");
      return;
    }
    
    const errorMessage = err.response?.data?.message || err.message || defaultMessage;
    alert(errorMessage);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect if no state provided
  useEffect(() => {
    if (!state || !state.productId) {
      alert("No product selected for bargaining");
      navigate("/products");
    }
  }, [state, navigate]);

  // Fetch product and initialize bargain
  useEffect(() => {
    if (!state || !state.productId || !token) return;

    const fetchBargainData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to fetch product details
        let productData = null;
        try {
          const productRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/products/${state.productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            }
          );
          productData = productRes.data;
          setProduct(productData);
        } catch (productErr) {
          console.error("Failed to fetch product:", productErr);
          // Continue without product data if API fails
          setProduct({
            _id: state.productId,
            name: "Product Name",
            price: "N/A",
            description: "Product details unavailable"
          });
        }

        // Then, start or fetch bargain
        try {
          const bargainRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/bargains/start`,
            { 
              productId: state.productId, 
              vendorId: state.vendorId, 
              price: 0 
            },
            { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            }
          );
          
          setMessages(bargainRes.data.messages || []);
          setBargainId(bargainRes.data._id);
          localStorage.setItem("bargainId", bargainRes.data._id);
        } catch (bargainErr) {
          handleApiError(bargainErr, "Failed to start bargaining session");
          setError("Failed to initialize bargain");
        }

      } catch (err) {
        console.error("Error in fetchBargainData:", err);
        setError("Failed to load bargaining session");
        handleApiError(err, "Failed to initialize bargaining session");
      } finally {
        setLoading(false);
      }
    };

    fetchBargainData();
  }, [state, token, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message function
  const sendMessage = async () => {
    if (!price.trim()) {
      alert("Please enter a price offer");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    if (!bargainId) {
      alert("Bargain session not initialized. Please refresh the page.");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bargains/${bargainId}/message`,
        { text: `Offer ₹${price}`, price: numericPrice },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
        setPrice("");
        alert("Offer sent successfully!");
      } else {
        alert("Message sent but unable to refresh conversation. Please refresh the page.");
      }
    } catch (err) {
      handleApiError(err, "Failed to send offer");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !sending) {
      sendMessage();
    }
  };

  // Show loading state
  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting bargaining session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/products")}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-medium transition-colors duration-200"
          >
            ← Back to Products
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2V6a2 2 0 012-2h6a2 2 0 012 2v2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bargain Chat</h1>
                <p className="text-gray-600">Negotiate the best price with the vendor</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Info Card */}
          {product && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Details</h3>
                <div className="space-y-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Original Price:</span>
                        <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                      </div>
                      {product.stock && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Stock:</span>
                          <span className="text-sm font-medium">{product.stock} available</span>
                        </div>
                      )}
                      {product.vendor && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Vendor:</span>
                          <span className="text-sm font-medium">{product.vendor.name || 'Unknown'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">💬 Bargaining Session</h3>
                  <div className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {messages.length} messages
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No messages yet. Start by making an offer!</p>
                    <p className="text-sm text-gray-400">💡 Tip: Start with a reasonable offer below the listed price</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.sender === currentUserRole || msg.sender === 'Customer' ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                            msg.sender === currentUserRole || msg.sender === 'Customer'
                              ? "bg-blue-600 text-white"
                              : "bg-white border text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              msg.sender === currentUserRole || msg.sender === 'Customer' 
                                ? "text-blue-100" 
                                : "text-gray-500"
                            }`}>
                              {msg.sender === currentUserRole || msg.sender === 'Customer' ? "You" : "Vendor"}
                            </span>
                            {msg.price && (
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                msg.sender === currentUserRole || msg.sender === 'Customer'
                                  ? "bg-white bg-opacity-20 text-white"
                                  : "bg-green-100 text-green-800"
                              }`}>
                                ₹{msg.price}
                              </span>
                            )}
                          </div>
                          <p className={`${
                            msg.sender === currentUserRole || msg.sender === 'Customer' 
                              ? "text-white" 
                              : "text-gray-800"
                          }`}>
                            {msg.text || 'No message'}
                          </p>
                          {msg.timestamp && (
                            <div className={`text-xs mt-1 ${
                              msg.sender === currentUserRole || msg.sender === 'Customer' 
                                ? "text-blue-100" 
                                : "text-gray-400"
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Enter your price offer (e.g., 500)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={sending}
                      min="1"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Tip: Make a reasonable offer to start negotiations
                    </p>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={sending || !price.trim() || !bargainId}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      sending || !price.trim() || !bargainId
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {sending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Offer
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Bargaining Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Start with a reasonable offer below the listed price</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Be polite and respectful in your negotiations</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Consider the vendor's perspective and costs</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Be prepared to meet somewhere in the middle</span>
            </div>
          </div>
        </div>

        {/* Status Section */}
        {bargainId && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Bargain ID: <span className="font-mono">{bargainId}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BargainChat;