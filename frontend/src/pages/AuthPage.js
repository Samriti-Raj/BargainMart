

// src/pages/AuthPage.js
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ onLogin }) => {   // 👈 changed from setIsLoggedIn to onLogin
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    shopDescription: "",
    shopAddress: "",
    gstNumber: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isRegister) {
        res = await axios.post("http://localhost:5000/api/auth/register", {
          ...formData,
          role,
        });
        toast.success(`${role} registered successfully! Please login.`);
        setIsRegister(false);
        // Clear password after successful registration
        setFormData({ ...formData, password: "" });
      } else {
        res = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const userRole = res.data.user?.role?.toLowerCase() || res.data.role?.toLowerCase();
        const userToken = res.data.token;

        // Use centralized login handler
        onLogin(userToken, userRole);

        toast.success(`Welcome ${res.data.user?.name || "User"}!`);

        if (userRole === "vendor") {
          navigate("/vendor/dashboard");
        } else {
          navigate("/product"); // Navigate to products for customers
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error occurred");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isRegister ? "Register" : "Login"} as {role}
      </h2>

      {/* Role Selector */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded ${role === "customer" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("customer")}
          type="button"
        >
          Customer
        </button>
        <button
          className={`px-3 py-1 rounded ${role === "vendor" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setRole("vendor")}
          type="button"
        >
          Vendor
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded"
              required
            />
            {role === "vendor" && (
              <>
                <input
                  type="text"
                  placeholder="Shop Name"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="border p-2 rounded"
                  required
                />
                <textarea
                  placeholder="Shop Description"
                  value={formData.shopDescription}
                  onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                  className="border p-2 rounded h-20 resize-none"
                  rows="2"
                />
                <input
                  type="text"
                  placeholder="Shop Address"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="GST Number (Optional)"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="border p-2 rounded"
                />
              </>
            )}
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-blue-600 underline hover:text-blue-700"
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>

    </div>
  );
};

export default AuthPage;