import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login as vendor to view your orders.");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/orders/vendor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Failed to fetch vendor orders.");
      }
    };

    fetchVendorOrders();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Orders for Your Products</h2>
      {orders.length === 0 ? (
        <p>No orders yet for your products.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">Order ID: {order._id}</h3>
              <p>Status: <span className="font-semibold">{order.status}</span></p>
              <p>Total: ₹{order.totalAmount}</p>
              <h4 className="mt-2 font-semibold">Your Products in This Order:</h4>
              <ul className="list-disc list-inside">
                {order.products
                  .filter((p) => p.vendorId === localStorage.getItem("userId"))
                  .map((item, index) => (
                    <li key={index}>
                      {item.name} - ₹{item.price} x {item.quantity}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
