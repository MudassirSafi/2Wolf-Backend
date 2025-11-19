// ✅ wolf-backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["Stripe", "Card", "stripe", "card"],
      default: "Stripe",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    stripeSessionId: {
      type: String,
      sparse: true
    },
    paidAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);