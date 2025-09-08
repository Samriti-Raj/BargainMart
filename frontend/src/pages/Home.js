import React, { useState, useEffect } from "react";
import AuthPage from "./AuthPage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import pic1 from "../images/pic1.jpeg";

const Home = ({ isLoggedIn, onLogin }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products to show in the preview section
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/all`);
        setProducts(res.data); // Show all products
        setLoading(false);
      } catch (err) {
        console.log("Error fetching products:", err);
        setLoading(false);
      }
    };
    
    if (!isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Hero Section */}
      <div className="w-full flex min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-300/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-200/10 to-yellow-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Left Section (Main Content) - Enhanced with better background */}
        <div 
          className={`${isLoggedIn ? 'flex-1' : 'flex-1 lg:flex-[0.65]'} p-6 lg:p-12 flex flex-col justify-center relative z-10`}
          style={!isLoggedIn ? { 
            backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(249, 115, 22, 0.1) 100%), url(${pic1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
        >
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/70 to-purple-50/60 backdrop-blur-sm"></div>
          
          <div className="max-w-3xl relative z-20 mx-auto">
            {/* Enhanced Hero Title with Animation */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight text-center">
                Welcome to Multi Vendor
                <span className="block text-3xl lg:text-5xl mt-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Ecommerce Platform
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-700 mb-8 leading-relaxed font-medium text-center">
                🌟 Discover amazing products from verified vendors worldwide.
                {isLoggedIn
                  ? " Your shopping journey starts here!"
                  : " Join thousands of satisfied customers today!"}
              </p>
            </div>

            {isLoggedIn && (
              <div className="space-y-8 animate-slide-up">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">What would you like to do today?</h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Shop Products Card */}
                  <div className="group p-8 bg-gradient-to-br from-white to-blue-50 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-white/50">
                    <div className="text-4xl mb-4 group-hover:animate-bounce">🛍️</div>
                    <h3 className="text-2xl font-bold mb-3 text-blue-700">Browse Products</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">Discover amazing products from our trusted vendors with competitive prices</p>
                    <button 
                      onClick={() => navigate("/product")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Start Shopping →
                    </button>
                  </div>
                  
                  {/* Orders Card */}
                  <div className="group p-8 bg-gradient-to-br from-white to-green-50 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border border-white/50">
                    <div className="text-4xl mb-4 group-hover:animate-bounce">📦</div>
                    <h3 className="text-2xl font-bold mb-3 text-green-700">Your Orders</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">Track and manage all your orders in one convenient place</p>
                    <button 
                      onClick={() => navigate("/my-orders")}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      View Orders →
                    </button>
                  </div>
                </div>

                {/* Special Feature Card */}
                <div className="mt-10 p-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-2xl text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-102">
                  <div className="flex items-center gap-4 mb-4 justify-center">
                    <div className="text-4xl animate-pulse">🎯</div>
                    <h3 className="text-2xl font-bold">Exclusive Bargaining Feature</h3>
                  </div>
                  <p className="text-lg opacity-95 leading-relaxed text-center">
                    💬 Chat directly with vendors and negotiate the best prices! Our unique bargaining system helps you save more on every purchase.
                  </p>
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="space-y-8 animate-slide-up">
                <div className="grid gap-6">
                  {/* Feature Cards */}
                  {[
                    {
                      icon: "🛍️",
                      title: "Browse Thousands of Products",
                      desc: "Explore our vast catalog from verified vendors worldwide",
                      gradient: "from-blue-500 to-cyan-500"
                    },
                    {
                      icon: "💬",
                      title: "Smart Bargaining System",
                      desc: "Chat with vendors and negotiate the best deals in real-time",
                      gradient: "from-green-500 to-emerald-500"
                    },
                    {
                      icon: "🔒",
                      title: "Secure & Fast Checkout",
                      desc: "Safe payment processing with multiple payment options",
                      gradient: "from-purple-500 to-pink-500"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="group flex items-center gap-6 p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Scroll Indicator */}
                <div className="mt-16 text-center">
                  <div className="inline-flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
                    <p className="text-gray-700 font-semibold text-lg">Discover Amazing Products Below</p>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="text-sm font-medium">Scroll to explore</span>
                      <div className="animate-bounce">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section for Logged In Users - NEW ENHANCEMENT */}
        {isLoggedIn && (
          <div className="hidden lg:flex lg:flex-[0.4] min-h-screen relative z-10">
            <div className="w-full relative overflow-hidden">
              {/* Beautiful Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.8), rgba(249, 115, 22, 0.7)), url(${pic1})`
                }}
              ></div>
              
              {/* Overlay Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center p-8">
                {/* Welcome Stats */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 mb-8 w-full max-w-sm">
                  <div className="text-center">
                    <div className="text-5xl mb-4">👋</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h3>
                    <p className="text-gray-600 mb-6">Ready to discover amazing deals?</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-600">500+</div>
                        <div className="text-sm text-gray-600">Products</div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-600">50+</div>
                        <div className="text-sm text-gray-600">Vendors</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate("/product")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
                    >
                      Start Exploring 🚀
                    </button>
                  </div>
                </div>

                {/* Featured Benefits */}
                <div className="space-y-4 w-full max-w-sm">
                  {[
                    { icon: "💰", title: "Best Prices", desc: "Negotiate with vendors" },
                    { icon: "⚡", title: "Fast Delivery", desc: "Quick & reliable shipping" },
                    { icon: "🛡️", title: "Secure Shopping", desc: "Protected payments" }
                  ].map((benefit, index) => (
                    <div key={index} className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/50 hover:bg-white/95 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{benefit.icon}</div>
                        <div>
                          <h4 className="font-bold text-gray-800">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 right-8 text-4xl animate-bounce delay-1000">🎁</div>
                <div className="absolute bottom-20 left-8 text-3xl animate-pulse delay-2000">✨</div>
              </div>
            </div>
          </div>
        )}

        {/* Right Section (Auth Form) - Enhanced Design */}
        {!isLoggedIn && (
          <div className="hidden lg:flex lg:flex-[0.35] min-h-screen relative z-10">
            <div className="w-full flex items-center justify-center p-8">
              <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/30 hover:shadow-3xl transition-all duration-500">
                  <AuthPage onLogin={onLogin} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Auth Section */}
        {!isLoggedIn && (
          <div className="lg:hidden w-full absolute bottom-0 left-0 right-0 z-20">
            <div className="p-6 bg-white/95 backdrop-blur-xl shadow-2xl rounded-t-3xl border-t border-white/30">
              <AuthPage onLogin={onLogin} />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Products Preview Section */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-b from-gray-50 via-white to-blue-50 py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-blue-600 font-semibold text-lg uppercase tracking-wider">Featured Collection</span>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Trending Products
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                🚀 Discover our most popular items from trusted vendors. Login to start shopping and unlock exclusive bargaining features!
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-96 animate-pulse shadow-lg"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                  {products.slice(0, 8).map((product, index) => (
                    <div key={product._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:scale-105 hover:-translate-y-2">
                      <div className="relative overflow-hidden">

                        <img
  src={
    product.images && product.images.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`
      : "/api/placeholder/400/300"
  }
  alt={product.name}
  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
  onError={(e) => {
    e.target.src = "/api/placeholder/400/300";
  }}
/>


                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/50">
                          <span className="text-green-600">✓ {product.stock} in stock</span>
                        </div>
                        {index < 3 && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            🔥 TRENDING
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 leading-5">
                          {product.description}
                        </p>
                        
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex flex-col">
                            <span className="text-3xl font-black text-blue-600">₹{product.price}</span>
                            <span className="text-xs text-gray-500">Best Price Guaranteed</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 block">Sold by</span>
                            <span className="text-sm font-semibold text-gray-800">{product.vendor?.name || 'Vendor'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <button 
                            className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 py-3 px-4 rounded-xl cursor-not-allowed font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            disabled
                          >
                            🔒 Login to Add to Cart
                          </button>
                          <button 
                            className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 py-3 px-4 rounded-xl cursor-not-allowed font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            disabled
                          >
                            💬 Login to Start Bargaining
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Sticky Call-to-Action */}
                <div className="sticky bottom-8 mx-auto max-w-lg z-30">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-lg hover:scale-105 transition-all duration-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4 animate-bounce">🛒✨</div>
                      <h3 className="font-black text-2xl mb-3">Ready to Start Shopping?</h3>
                      <p className="text-sm mb-6 opacity-95 leading-relaxed">
                        Join our community of smart shoppers! Login now to unlock exclusive bargaining features and start saving on every purchase.
                      </p>
                      <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
                      >
                        Get Started Now ↑
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-8">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-600 mb-4">No Products Available</h3>
                <p className="text-gray-500 text-xl">Check back later for amazing new products from our vendors!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Home;





