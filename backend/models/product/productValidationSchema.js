import Joi from "joi";
import {
  objectId,
  uuidV6,
  safeStringRegex,
  xssValidator,
} from "../../utils/commonValidators.js";
// const safeDescriptionPattern = /^[\p{L}\p{N}\p{M} .,!?'"()\-:&/%+#*@\n\r]*$/u;

export const productValidationSchema = Joi.object({
  name: xssValidator().max(100).messages({
    "string.empty": "Product name is required.",
    "string.pattern.base": "Product name can only contain letters.",
    "string.max": "Product name cannot be longer than 100 characters.",
  }),
  description: xssValidator().messages({
    "string.empty": "Product description is required.",
    "string.pattern.base":
      "Product description can only contain letters, numbers, spaces, line breaks, and common punctuation: . , ! ? ' \" ( ) - : & / % + # * @",
  }),
  price: Joi.number().required(),
  discountPrice: Joi.number(),
  countInStock: Joi.number().required().default(0),
  sku: xssValidator().messages({
    "any.required": "sku is required.",
    "string.empty": "sku cannot be empty.",
    "string.pattern.base":
      "sku can only contain letters, numbers, underscores and hyphens.",
  }),
  category: xssValidator().messages({
    "any.required": "category is required.",
    "string.empty": "category cannot be empty.",
    "string.pattern.base":
      "category can only contain letters, underscores and hyphens spaces.",
  }),
  brand: xssValidator().messages({
    "string.empty": "brand cannot be empty.",
    "string.pattern.base":
      "brand can only contain letters, underscores and hyphens spaces.",
  }),
  sizes: Joi.array().items(
    xssValidator()
      .custom((size) => size.toUpperCase())
      .required()
      .messages({
        "any.required": "sizes is required.",
        "string.empty": "sizes cannot be empty.",
        "string.pattern.base": "sizes can only contain letters",
      }),
  ),
  colors: Joi.array().items(
    xssValidator()
      .custom((color) => color.toLowerCase())
      .required()
      .messages({
        "any.required": "colors field is required.",
        "string.empty": "colors field cannot be empty.",
        "string.pattern.base":
          "colors field can only contain letters and spaces",
      }),
  ),
  collections: Joi.array().items(
    xssValidator()
      .custom((collection) => collection.toLowerCase())
      .required()
      .messages({
        "any.required": "colors field is required.",
        "string.empty": "colors field cannot be empty.",
        "string.pattern.base":
          "colors field can only contain letters, underscores and hyphens spaces.",
      }),
  ),
  material: xssValidator().messages({
    "string.empty": "material field cannot be empty.",
    "string.pattern.base":
      "material field can only contain letters, underscores and hyphens spaces.",
  }),
  gender: xssValidator().valid("Men", "Women", "Unisex").messages({
    "string.empty": "gender field cannot be empty.",
    "string.pattern.base":
      "gender field can only contain any of these values Men, Women, Unisex",
  }),
  images: Joi.array().items(
    Joi.object({
      // only http or https
      url: xssValidator()
        .uri({ scheme: [/https?/] })
        .required(),
      altText: Joi.string().trim().max(100).optional().empty("").empty(null),
    }),
  ),
  isFeatured: Joi.boolean().default(false),
  isPublished: Joi.boolean().default(false),
  rating: Joi.number().default(0),
  numReviews: Joi.number().default(0),
  tags: Joi.array().items(
    xssValidator()
      .pattern(/^[A-Za-z0-9_-]{2,30}$/)
      .messages({
        "string.pattern.base":
          "Each tag must be 2–30 characters and may contain letters, numbers, underscores, or hyphens.",
      }),
  ),
  metaTitle: xssValidator().max(100).messages({
    "string.pattern.base":
      "metaTitle may only contain letters, numbers, spaces, underscores and hyphens.",
    "string.max": "metaTitle cannot exceed 100 characters.",
  }),
  metaDescription: xssValidator().max(100).messages({
    "string.pattern.base":
      "metaDescription may only contain letters, numbers, spaces, underscores and hyphens.",
    "string.max": "metaDescription cannot exceed 100 characters.",
  }),
  metaKeywords: xssValidator().max(100).messages({
    "string.pattern.base":
      "metaKeywords may only contain letters, numbers, spaces, underscores and hyphens.",
    "string.max": "metaKeywords cannot exceed 100 characters.",
  }),
  dimensions: Joi.object({
    length: Joi.number(),
    width: Joi.number(),
    height: Joi.number(),
  }),
  weight: Joi.number(),
}).prefs({ stripUnknown: true });

export const updateProductSchema = productValidationSchema
  .fork(
    [
      "name",
      "description",
      "price",
      "discountPrice",
      "countInStock",
      "sku",
      "category",
      "brand",
      "sizes",
      "colors",
      "collections",
      "material",
      "gender",
      "images",
      "isFeatured",
      "isPublished",
      "rating",
      "numReviews",
      "tags",
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "dimensions",
      "weight",
    ],
    (schema) => schema.optional().empty(null).empty(""),
  )
  .prefs({ stripUnknown: true });

/**
 * Query params validation schema
 */

const stripEmptyString = (schema) => schema.optional().empty("").empty(null);

export const queryValidationSchema = Joi.object({
  collection: stripEmptyString(
    xssValidator().custom((collection) => collection.toLowerCase()),
  ),
  category: stripEmptyString(xssValidator()),
  gender: stripEmptyString(Joi.string().trim().valid("Men", "Women", "Unisex")),
  color: stripEmptyString(xssValidator().custom((size) => size.toLowerCase())),
  size: stripEmptyString(
    xssValidator()
      .custom((size) => size.toUpperCase())
      .pattern(/^(XS|S|M|L|XL|XXL)(,(XS|S|M|L|XL|XXL))*$/),
  ),
  material: stripEmptyString(
    xssValidator().custom((size) => size.toLowerCase()),
  ),
  brand: stripEmptyString(xssValidator()),
  minPrice: Joi.number().integer().min(0),
  maxPrice: Joi.number().integer().min(1).max(100),
  sortBy: stripEmptyString(
    xssValidator().valid("priceAsc", "popularity", "priceDesc"),
  ),
  search: stripEmptyString(xssValidator().max(100)),
  limit: Joi.number().integer().min(1).max(100),
}).prefs({
  stripUnknown: true,
});
