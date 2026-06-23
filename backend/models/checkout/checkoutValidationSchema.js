import Joi from "joi";
import xss from "xss";

// Helper for user (MongoDB ObjectId) validation
import { objectId } from "../../utils/commonValidators.js";

// Helper for guestId (uuidV6)  validation
import { uuidV6 } from "../../utils/commonValidators.js";

//Helper for XSS vulnarabilities
import { xssValidator } from "../../utils/commonValidators.js";

// Checkout Item Schema (mirrors orderItemSchema)
import { orderItemSchema } from "../order/orderValidationSchema.js";

// Shipping Address Schema
export const shippingAddressSchema = Joi.object({
  address: xssValidator().required(),
  city: xssValidator().required(),
  postalCode: xssValidator().required(),
  country: xssValidator().required(),
});

// Main Checkout Schema
export const checkoutValidationSchema = Joi.object({
  user: objectId.required(),
  checkoutItems: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: shippingAddressSchema.required(),
  paymentMethod: xssValidator()
    // .valid("Paypal", "stripe", "credit_card")
    .required(),
  totalPrice: Joi.number().min(0).required(),
  isPaid: Joi.boolean().default(false),
  paidAt: Joi.date().optional(),
  paymentStatus: xssValidator()
    .valid("pending", "completed", "failed", "refunded")
    .default("pending"),
  paymentDetails: Joi.object().unknown(true).optional(), // flexible for mixed payment data
  isFinalized: Joi.boolean().default(false),
  finalizedAt: Joi.date().optional(),
}).prefs({ stripUnknown: true });

//Update checkoutValidationSchema
export const UpdateCheckoutValidationSchema = checkoutValidationSchema.fork(
  [
    "user",
    "checkoutItems",
    "shippingAddress",
    "paymentMethod",
    "totalPrice",
    "isPaid",
    "paidAt",
    "paymentStatus",
    "paymentDetails",
    "isFinalized",
    "finalizedAt",
  ],
  (schema) => schema.optional().empty("").empty(null).empty(undefined),
);
