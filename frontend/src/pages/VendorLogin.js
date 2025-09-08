
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VendorLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/vendor/login`, formData);
      
      const userRole = res.data.role.toLowerCase();
      const userToken = res.data.token;

      // Use the centralized login handler from App.js
      onLogin(userToken, userRole);

      if (userRole === "vendor") {
        navigate("/vendor/dashboard");
      } else {
        alert("Access denied: Not a vendor account");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Vendor Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 w-full mb-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 w-full mb-3"
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default VendorLogin;