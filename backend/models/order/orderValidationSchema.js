import Joi from "joi";
import {
  objectId,
  uuidV6,
  safeStringRegex,
  xssValidator,
} from "../../utils/commonValidators.js";

// Order Item Schema
export const orderItemSchema = Joi.object({
  productId: objectId, // MongoDB ObjectId
  name: xssValidator().pattern(safeStringRegex).required(),
  image: Joi.string().uri().required(),
  price: Joi.number().min(0).required(),
  size: xssValidator().pattern(safeStringRegex).optional(),
  color: xssValidator().pattern(safeStringRegex).optional(),
  quantity: Joi.number().integer().min(1).required(),
});


const shippingAddressSchema = Joi.object({
  address: xssValidator().pattern(safeStringRegex).required(),
  city: xssValidator().pattern(safeStringRegex).required(),
  postalCode: xssValidator().required(),
  country: xssValidator().pattern(safeStringRegex).required(),
});

export const orderValidationSchema = Joi.object({
  user: objectId, // required ObjectId

  orderItems: Joi.array().items(orderItemSchema).min(1).required(),

  shippingAddress: shippingAddressSchema.required(),

  paymentMethod: xssValidator()
    .valid("paypal", "stripe", "credit_card")
    .required(),

  paymentDetails: Joi.object().unknown(true).optional(), // flexible Mixed type

  totalPrice: Joi.number().min(0).required(),

  isPaid: Joi.boolean().default(false),

  paidAt: Joi.date().optional(),

  isDelivered: Joi.boolean().default(false),

  deliveredAt: Joi.date().optional(),

  paymentStatus: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .default("pending"),

  status: Joi.string()
    .valid("Processing", "Shipped", "Delivered", "Cancelled")
    .default("Processing"),
}).prefs({ stripUnknown: true });
