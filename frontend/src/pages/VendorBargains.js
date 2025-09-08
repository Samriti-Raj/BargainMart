// src/pages/BargainRequests.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VendorBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [counterOffers, setCounterOffers] = useState({});
  const [expandedBargain, setExpandedBargain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingActions, setProcessingActions] = useState({});
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

  // Fetch bargains for the vendor
  const fetchBargains = useCallback(async () => {
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bargains/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setBargains(res.data);
    } catch (err) {
      setError("Failed to fetch bargain requests");
      handleApiError(err, "Failed to fetch bargain requests");
      setBargains([]);
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

  // Handle sending a counteroffer
  const sendCounterOffer = async (id) => {
    const offerPrice = counterOffers[id];
    if (!offerPrice || offerPrice <= 0) {
      alert("Please enter a valid counter offer price.");
      return;
    }

    setProcessingActions(prev => ({ ...prev, [id]: 'counter' }));
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bargains/${id}/message`,
        { 
          sender: "Vendor",
          text: `Vendor proposes ₹${offerPrice}`, 
          price: parseFloat(offerPrice) 
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setBargains((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
      setCounterOffers((prev) => ({ ...prev, [id]: "" }));
      alert("Counter offer sent successfully!");
    } catch (err) {
      handleApiError(err, "Failed to send counter offer");
    } finally {
      setProcessingActions(prev => ({ ...prev, [id]: null }));
    }
  };

  // Handle accept
  const acceptBargain = async (id, price) => {
    if (!window.confirm("Are you sure you want to accept this bargain?")) {
      return;
    }

    setProcessingActions(prev => ({ ...prev, [id]: 'accept' }));
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bargains/${id}/accept`,
        { price: parseFloat(price) },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setBargains((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
      alert("Bargain accepted successfully!");
    } catch (err) {
      handleApiError(err, "Failed to accept bargain");
    } finally {
      setProcessingActions(prev => ({ ...prev, [id]: null }));
    }
  };

  // Handle reject
  const rejectBargain = async (id) => {
    if (!window.confirm("Are you sure you want to reject this bargain?")) {
      return;
    }

    setProcessingActions(prev => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bargains/${id}/reject`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setBargains((prev) =>
        prev.map((b) => (b._id === id ? res.data : b))
      );
      alert("Bargain rejected.");
    } catch (err) {
      handleApiError(err, "Failed to reject bargain");
    } finally {
      setProcessingActions(prev => ({ ...prev, [id]: null }));
    }
  };

  // Handle delete
  const deleteBargain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bargain? This action cannot be undone.")) {
      return;
    }

    setProcessingActions(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/bargains/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setBargains((prev) => prev.filter((b) => b._id !== id));
      alert("Bargain deleted successfully.");
    } catch (err) {
      handleApiError(err, "Failed to delete bargain");
    } finally {
      setProcessingActions(prev => ({ ...prev, [id]: null }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-300";
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

  const getLatestCustomerOffer = (messages) => {
    const customerMessages = messages.filter(msg => 
      msg.sender === 'Customer' && msg.price
    );
    return customerMessages.length > 0 
      ? customerMessages[customerMessages.length - 1].price 
      : null;
  };

  // Check if customer has made any offer
  const hasCustomerMadeOffer = (messages) => {
    return messages.some(msg => msg.sender === 'Customer' && msg.price);
  };

  // Check if customer was the last to make an offer
  const isCustomerLastToOffer = (messages) => {
    if (!messages || messages.length === 0) return false;
    
    // Find the last message with a price from any sender
    const messagesWithPrice = messages.filter(msg => msg.price);
    if (messagesWithPrice.length === 0) return false;
    
    const lastOfferMessage = messagesWithPrice[messagesWithPrice.length - 1];
    return lastOfferMessage.sender === 'Customer';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bargain requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && bargains.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchBargains}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">🏪</span>
                Bargain Requests
              </h2>
              <p className="text-gray-600">Review and respond to customer bargaining requests</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchBargains}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {bargains.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bargain Requests</h3>
            <p className="text-gray-500 mb-4">You haven't received any bargaining requests yet.</p>
            <p className="text-sm text-gray-400">Customers will see your products and start bargaining sessions.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bargains.map((bargain) => (
              <div
                key={bargain._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 relative">
                  <button
                    onClick={() => deleteBargain(bargain._id)}
                    disabled={processingActions[bargain._id] === 'delete'}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                    title="Delete bargain"
                  >
                    {processingActions[bargain._id] === 'delete' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      '×'
                    )}
                  </button>
                  
                  <div className="flex items-center justify-between pr-12">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {bargain.product?.name || "Product Name"}
                      </h3>
                      <p className="text-purple-100">
                        Listed Price: ₹{bargain.product?.price || "N/A"}
                      </p>
                      <p className="text-purple-100 text-sm">
                        Customer: {bargain.customer?.name || "Unknown"} ({bargain.customer?.email || "No email"})
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bargain.status)}`}>
                      {bargain.status?.toUpperCase() || "UNKNOWN"}
                    </div>
                  </div>
                </div>

                {/* Customer Info & Latest Offer */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {bargain.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {bargain.customer?.name || "Unknown Customer"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {bargain.customer?.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    {getLatestCustomerOffer(bargain.messages || []) && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Latest Customer Offer</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{getLatestCustomerOffer(bargain.messages || [])}
                        </p>
                      </div>
                    )}
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
                        View Negotiation History ({bargain.messages?.length || 0} messages)
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
                            className={`flex ${msg.sender === 'Vendor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                                msg.sender === 'Vendor'
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white text-gray-800 border'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${
                                  msg.sender === 'Vendor' ? 'text-purple-100' : 'text-gray-500'
                                }`}>
                                  {msg.sender || 'Unknown'}
                                </span>
                                {msg.timestamp && (
                                  <span className={`text-xs ${
                                    msg.sender === 'Vendor' ? 'text-purple-100' : 'text-gray-400'
                                  }`}>
                                    {formatTime(msg.timestamp)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{msg.text || 'No message'}</p>
                              {msg.price && (
                                <div className={`mt-1 px-2 py-1 rounded text-xs font-bold ${
                                  msg.sender === 'Vendor' 
                                    ? 'bg-purple-400 text-white' 
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
                  {bargain.status === "pending" || bargain.status === "ongoing" ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Enter your counter offer..."
                            value={counterOffers[bargain._id] || ""}
                            onChange={(e) =>
                              setCounterOffers({
                                ...counterOffers,
                                [bargain._id]: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            min="1"
                            disabled={processingActions[bargain._id]}
                          />
                        </div>
                        <button
                          onClick={() => sendCounterOffer(bargain._id)}
                          disabled={processingActions[bargain._id] === 'counter'}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                        >
                          {processingActions[bargain._id] === 'counter' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          ) : (
                            <span className="mr-2">💬</span>
                          )}
                          Send Counter
                        </button>
                      </div>

                      {/* Show Accept/Reject buttons only if customer was the last to make an offer */}
                      {isCustomerLastToOffer(bargain.messages || []) && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              acceptBargain(
                                bargain._id,
                                counterOffers[bargain._id] ||
                                  getLatestCustomerOffer(bargain.messages || []) ||
                                  bargain.product?.price || 0
                              )
                            }
                            disabled={processingActions[bargain._id] === 'accept'}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                          >
                            {processingActions[bargain._id] === 'accept' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            ) : (
                              <span className="mr-2">✓</span>
                            )}
                            Accept Customer's Offer
                          </button>
                          <button
                            onClick={() => rejectBargain(bargain._id)}
                            disabled={processingActions[bargain._id] === 'reject'}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                          >
                            {processingActions[bargain._id] === 'reject' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            ) : (
                              <span className="mr-2">✗</span>
                            )}
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Show appropriate message based on the current state */}
                      {!hasCustomerMadeOffer(bargain.messages || []) ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <p className="text-blue-800 text-sm">
                            💡 Waiting for customer to make an offer. You can send a counter offer to start the negotiation.
                          </p>
                        </div>
                      ) : !isCustomerLastToOffer(bargain.messages || []) ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                          <p className="text-yellow-800 text-sm">
                            ⏳ Waiting for customer's response to your counter offer.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-green-800 text-sm">
                            🎯 Customer has made an offer. You can accept it, reject it, or send a counter offer.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : bargain.status === "accepted" ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <p className="text-green-800 font-bold text-lg">
                        Deal Accepted!
                      </p>
                      <p className="text-green-700 mt-1">
                        Final Price: ₹{bargain.finalPrice || "N/A"}
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        The customer has been notified and can proceed to checkout.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">❌</div>
                      <p className="text-red-800 font-bold">
                        Bargain Rejected
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        This bargaining session has been closed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendor Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Vendor Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">✓</span>
              <span>Respond promptly to maintain customer interest</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">✓</span>
              <span>Consider your profit margins when accepting offers</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">✓</span>
              <span>Be professional and courteous in negotiations</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">✓</span>
              <span>Use counter offers to find a mutually beneficial price</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBargains;



































