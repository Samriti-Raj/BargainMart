import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ----------------------
// Create a new order (Customer)
// ----------------------
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shipping, payment } = req.body;

    const newOrder = new Order({
      user: req.user.id, // logged-in user
      products,
      totalAmount,
      shipping,
      payment
    });

    await newOrder.save();
    res.status(201).json({ msg: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Get all orders of logged-in user (Customer)
// ----------------------
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Populate product details for each order item
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedProducts = await Promise.all(
          order.products.map(async (item) => {
            let productData = { ...item.toObject() };

            if (item.productId) {
              try {
                const product = await Product.findById(item.productId);
                if (product) {
                  // Merge product snapshot data
                  productData = {
                    ...productData,
                    image: product.image || product.images?.[0],
                    images: product.images,
                    description: product.description,
                    category: product.category
                  };
                }
              } catch (err) {
                console.error(`Product not found: ${item.productId}`, err);
              }
            }

            return productData;
          })
        );

        return {
          ...order.toObject(),
          products: populatedProducts
        };
      })
    );

    console.log("Sending populated orders:", JSON.stringify(populatedOrders, null, 2)); // Debug log
    res.json(populatedOrders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Get all orders for vendor
// ----------------------
export const getVendorOrders = async (req, res) => {
  try {
    // Find orders containing at least one product from this vendor
    const orders = await Order.find({
      "products.vendorId": req.user.id,
    }).sort({ createdAt: -1 });

    // Populate product details for vendor-specific products
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedProducts = await Promise.all(
          order.products.map(async (item) => {
            let productData = { ...item.toObject() };

            if (item.productId && item.vendorId.toString() === req.user.id) {
              try {
                const product = await Product.findById(item.productId);
                if (product) {
                  productData = {
                    ...productData,
                    image: product.image || product.images?.[0],
                    images: product.images,
                    description: product.description,
                    category: product.category
                  };
                }
              } catch (err) {
                console.error(`Product not found: ${item.productId}`, err);
              }
            }

            return productData;
          })
        );

        return {
          ...order.toObject(),
          products: populatedProducts
        };
      })
    );

    res.json(populatedOrders);
  } catch (err) {
    console.error("Error fetching vendor orders:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ----------------------
// Cancel an order (Customer only)
// ----------------------
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Ensure the order belongs to the logged-in user
    if (order.user.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to cancel this order" });
    }

    // Only allow cancellation for pending/processing orders
    const cancellableStatuses = ['pending', 'processing'];
    if (!cancellableStatuses.includes(order.status?.toLowerCase())) {
      return res.status(400).json({ 
        msg: `Cannot cancel order with status: ${order.status}. Only pending or processing orders can be cancelled.` 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({ 
      msg: "Order cancelled successfully", 
      order: {
        _id: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
