import Joi from "joi";

// Helper for user (MongoDB ObjectId) validation
const objectId = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId format")
  .required();

// Helper for guestId (uuidV6)  validation
const uuidV6 = Joi.string()
  .trim()
  .pattern(
    /^guest_[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
  .message("Invalid uuid format");

// Safe string regex (letters, numbers, spaces, hyphens, ampersands, commas, periods)
const safeStringRegex = /^[A-Za-z0-9\s\-&,.'"]+$/;

const stripEmptyString = (schema) => schema.optional();

/**
 * Cart Item Schema
 */
const cartValidation = Joi.object({
  userId: objectId,

  guestId: uuidV6,

  productId: objectId,

  size: Joi.string()
    .trim()
    .pattern(safeStringRegex)
    .message("size must be a valid size")
    .custom((size) => size.toUpperCase()),

  color: Joi.string()
    .pattern(safeStringRegex)
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
    (schema) => schema.optional(),
  )
  .prefs({
    stripUnknown: { objects: true },
  });
