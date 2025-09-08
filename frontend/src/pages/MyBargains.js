
// src/pages/MyBargains.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [counterPrice, setCounterPrice] = useState({});
  const [expandedBargain, setExpandedBargain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced error handling function
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
      alert("Resource not found. Please refresh the page.");
      return;
    }
    
    const errorMessage = err.response?.data?.message || err.message || defaultMessage;
    alert(errorMessage);
  };

  const fetchBargains = useCallback(async () => {
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bargains/customer`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      });
      setBargains(res.data);
    } catch (err) {
      setError("Failed to fetch bargains");
      handleApiError(err, "Failed to fetch bargains");
      setBargains([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchBargains();
  }, [fetchBargains]);

  useEffect(() => {
    scrollToBottom();
  }, [bargains]);

  // Accept Bargain
  const handleAccept = async (id, price, productId) => {
    if (!window.confirm("Are you sure you want to accept this bargain?")) {
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bargains/${id}/accept`,
        { price },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      alert("You accepted the bargain!");
      
      // Check if checkout route exists before navigating
      if (res.data && res.data._id) {
        navigate("/checkout", {
          state: {
            bargainId: res.data._id,
            productId,
            finalPrice: res.data.finalPrice || price,
          },
        });
      } else {
        // Refresh bargains if checkout navigation fails
        fetchBargains();
      }
    } catch (err) {
      handleApiError(err, "Failed to accept bargain");
    }
  };

  // Reject Bargain
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this bargain?")) {
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bargains/${id}/reject`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      alert("You rejected the bargain.");
      fetchBargains();
    } catch (err) {
      handleApiError(err, "Failed to reject bargain");
    }
  };

  // Counter Offer
  const handleCounterOffer = async (id) => {
    try {
      const price = counterPrice[id];
      if (!price || price <= 0) {
        alert("Please enter a valid counter price.");
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bargains/${id}/message`,
        { text: `Counter Offer: ₹${price}`, price: parseFloat(price) },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      alert("Counter offer sent!");
      setCounterPrice({ ...counterPrice, [id]: "" });
      fetchBargains();
    } catch (err) {
      handleApiError(err, "Failed to send counter offer");
    }
  };

  // Delete Bargain
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bargain? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/bargains/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setBargains((prev) => prev.filter((b) => b._id !== id));
      alert("Bargain deleted successfully.");
    } catch (err) {
      handleApiError(err, "Failed to delete bargain");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return "";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bargains...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && bargains.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchBargains}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">💬</span>
                My Bargains
              </h2>
              <p className="text-gray-600">Negotiate and manage your product bargains</p>
            </div>
            <button
              onClick={fetchBargains}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {bargains.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bargains Yet</h3>
            <p className="text-gray-500 mb-4">Start bargaining with vendors to see your negotiations here!</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bargains.map((bargain) => (
              <div
                key={bargain._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 relative">
                  <button
                    onClick={() => handleDelete(bargain._id)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
                    title="Delete bargain"
                  >
                    ×
                  </button>
                  
                  <div className="flex items-center justify-between pr-12">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {bargain.product?.name || "Product Name"}
                      </h3>
                      <p className="text-indigo-100">
                        Original Price: ₹{bargain.product?.price || "N/A"}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bargain.status)}`}>
                      {bargain.status?.toUpperCase() || "UNKNOWN"}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4">
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedBargain(expandedBargain === bargain._id ? null : bargain._id)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-700">
                        View Conversation ({bargain.messages?.length || 0} messages)
                      </span>
                      <span className={`transform transition-transform duration-200 ${expandedBargain === bargain._id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                  </div>

                  {expandedBargain === bargain._id && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {(bargain.messages || []).map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.sender === 'Customer' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                                msg.sender === 'Customer'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-800 border'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${
                                  msg.sender === 'Customer' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {msg.sender || 'Unknown'}
                                </span>
                                {msg.timestamp && (
                                  <span className={`text-xs ${
                                    msg.sender === 'Customer' ? 'text-blue-100' : 'text-gray-400'
                                  }`}>
                                    {formatTime(msg.timestamp)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{msg.text || 'No message'}</p>
                              {msg.price && (
                                <div className={`mt-1 px-2 py-1 rounded text-xs font-bold ${
                                  msg.sender === 'Customer' 
                                    ? 'bg-blue-400 text-white' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  ₹{msg.price}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
 
                  {(bargain.status === "pending" || bargain.status === "ongoing") && (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
    {(() => {
      










        const lastMsg = bargain.messages[bargain.messages.length - 1];
const lastSender = lastMsg?.sender?.toLowerCase();

// show Accept/Reject only if vendor was the last sender
if (lastSender === "vendor") {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAccept(bargain._id)}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Accept
      </button>
      <button
        onClick={() => handleReject(bargain._id)}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Reject
      </button>
    </div>
  );
}

      // If last offer is from Customer -> show counter offer input (Vendor's turn)
      if (lastSender === "Customer") {
        return (
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Enter your counter offer..."
                value={counterPrice[bargain._id] || ""}
                onChange={(e) =>
                  setCounterPrice({
                    ...counterPrice,
                    [bargain._id]: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="1"
              />
            </div>
            <button
              onClick={() => handleCounterOffer(bargain._id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">💬</span>
              Send Counter
            </button>
          </div>
        );
      }

      return null;
    })()}
  </div>
)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBargains;