

// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import VendorDashboard from "./pages/VendorDashboard";
import Product from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/myOrders";
import VendorOrders from "./pages/vendorOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import BargainChat from "./pages/BargainChat";
import VendorBargains from "./pages/VendorBargains";
import VendorLogin from "./pages/VendorLogin";
import MyBargains from "./pages/MyBargains";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setIsLoggedIn(true);
      setRole(storedRole.toLowerCase());
    }
  }, []);

  // Login handler
  const handleLogin = (token, userRole) => {
    const normalizedRole = userRole.toLowerCase();
    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedRole);
    setIsLoggedIn(true);
    setRole(normalizedRole);

    // Redirect based on role
    navigate(normalizedRole === "vendor" ? "/vendor/dashboard" : "/product");
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/");
  };

  return (
    <div className="App">
      {/* Navbar */}
      {isLoggedIn && (
        <nav className="p-4 bg-gray-200 flex gap-4 sticky top-0 z-50">
          <Link to="/">Home</Link>
          <Link to="/product">Products</Link>

          {role === "customer" && (
            <>
              <Link to="/cart">My Cart ({cart.length})</Link>
              <Link to="/my-orders">My Orders</Link>
              <Link to="/my-bargains">Bargains</Link>
            </>
          )}

          {role === "vendor" && (
            <>
              <Link to="/vendor/dashboard">Vendor Dashboard</Link>
              <Link to="/vendor/bargains">Bargain Requests</Link>
              <Link to="/vendor/orders">Orders</Link>
            </>
          )}

          <button onClick={handleLogout} className="text-red-600">
            Logout
          </button>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} onLogin={handleLogin} />} />
        <Route path="/product" element={<Product cart={cart} setCart={setCart} />} />

        {/* Auth */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />}
        />
        <Route
          path="/vendor/login"
          element={isLoggedIn && role === "vendor" ? <Navigate to="/" replace /> : <VendorLogin onLogin={handleLogin} />}
        />

        {/* Customer Protected */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRole="customer">
              <Cart cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRole="customer">
              <Checkout cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRole="customer">
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bargains"
          element={
            <ProtectedRoute allowedRole="customer">
              <MyBargains />
            </ProtectedRoute>
          }
        />

        {/* Vendor Protected */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/bargains"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorBargains />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <ProtectedRoute allowedRole="vendor">
              <VendorOrders />
            </ProtectedRoute>
          }
        />

        {/* Shared Protected */}
        <Route
          path="/bargain"
          element={
            <ProtectedRoute>
              <BargainChat />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;



