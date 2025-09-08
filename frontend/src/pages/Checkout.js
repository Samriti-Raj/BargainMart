
import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Checkout = ({ cart, setCart }) => {
  const { state } = useLocation(); // get state passed from MyBargains accept
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    payment: "COD",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login before placing an order!");
      return;
    }

    // 🟢 If coming from a bargain acceptance
    if (state?.bargainId && state?.finalPrice) {
      const orderData = {
        products: [
          {
            productId: state.productId,
            price: state.finalPrice,
            quantity: 1,
          },
        ],
        products: [
          {
            productId: state.productId,
            vendorId: state.vendorId,   // add this
            price: state.finalPrice,
            quantity: 1,
          },
        ],

        totalAmount: state.finalPrice,
        shipping: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        payment: formData.payment,
        bargainId: state.bargainId,
      };

      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, orderData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        alert("Order placed successfully at bargained price!");
        console.log(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Failed to place order. Please try again.");
      }

      return;
    }

    // 🟡 Default cart checkout
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      products: cart.map((item) => ({
        productId: item._id,
        vendorId: item.vendor,   // add this
        name: item.name,
        price: item.price,
        quantity: 1,
      })),

      totalAmount: cart.reduce((acc, item) => acc + item.price, 0),
      shipping: {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
      },
      payment: formData.payment,
    };

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Order placed successfully!");
      console.log(res.data);
      setCart([]); // clear cart after order
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      {state?.finalPrice ? (
        <p className="text-green-700 font-semibold mb-2">
          Proceeding with bargained price: ₹{state.finalPrice}
        </p>
      ) : (
        <p className="mb-2">
          Total Cart Price: ₹{cart.reduce((acc, item) => acc + item.price, 0)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <select
          name="payment"
          value={formData.payment}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="COD">Cash on Delivery</option>
          <option value="UPI">UPI</option>
          <option value="Card">Credit/Debit Card</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
