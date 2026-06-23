import mongoose from "mongoose";
import { orderItemSchema } from "../order/Order.js";

// const checkoutItemSchema = new mongoose.Schema(
//   {
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//   },
//   { _id: false },
// );

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkoutItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      default: "pending", //supposed to be enum??
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed, // store payment-related details (transaction ID, paypal response)
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Checkout", checkoutSchema);
