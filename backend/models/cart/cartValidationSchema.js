import Joi from "joi";
import xss from "xss";

// Helper for user (MongoDB ObjectId) validation
import { objectId } from "../../utils/commonValidators.js";

// Helper for guestId (uuidV6)  validation
import { uuidV6 } from "../../utils/commonValidators.js";

//Helper for XSS vulnarabilities
import { xssValidator } from "../../utils/commonValidators.js";

const stripEmptyString = (schema) => schema.optional();

/**
 * Cart Item Schema
 */
const cartValidation = Joi.object({
  userId: objectId,

  guestId: uuidV6,

  productId: objectId,

  size: xssValidator()
  .custom((size) => size.toUpperCase())
  .message("size must be a valid size"),

  color: xssValidator()
    .message("color must be a valid color")
    .trim()
    .custom((color) => color.toLowerCase()),

  quantity: Joi.number().integer().default(1),
}).prefs({
  stripUnknown: { objects: true },
});

export const cartValidationSchema = cartValidation
  .fork(
    ["productId", "size", "color", "quantity", "guestId", "userId"],
    (schema) => schema.optional().empty(null),
  )
  .prefs({
    stripUnknown: { objects: true },
  });
