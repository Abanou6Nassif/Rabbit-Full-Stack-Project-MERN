import Joi from "joi";
import xss from "xss";

// Helper for guestId (uuidV6)  validation
import { uuidV6 } from "../../utils/commonValidators.js";

// Helper for productId (MongoDB ObjectId) validation
import { objectId } from "../../utils/commonValidators.js";

//Helper for XSS vulnarabilities
import { xssValidator } from "../../utils/commonValidators.js";

const stripEmptyString = (schema) => schema.optional();

/**
 * Cart Item Schema
 *
 * SECURITY: `userId` is intentionally NOT part of this schema. Who the
 * cart belongs to must always come from the authenticated session
 * (req.user._id via optionalAuthenticate), never from a client-supplied
 * field - otherwise anyone could read/modify another user's cart just by
 * passing their Mongo id in the request body/query.
 */
const cartValidation = Joi.object({
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
    ["productId", "size", "color", "quantity", "guestId"],
    (schema) => schema.optional().empty(null),
  )
  .prefs({
    stripUnknown: true,
  });
