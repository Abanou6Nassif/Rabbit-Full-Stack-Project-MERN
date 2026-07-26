import Joi from "joi";
import xss from "xss";

// Helper for user (MongoDB ObjectId) validation
export const objectId = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId format")
  .required();

// Helper for guestId (uuidV6)  validation
export const uuidV6 = Joi.string()
  .trim()
  .pattern(
    /^guest_[0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
  .message("Invalid uuid format");

// Safe string regex (letters, numbers, spaces, hyphens, ampersands, commas, periods)
export const safeStringRegex = /^[A-Za-z0-9\s\-&,.'"]+$/;

/**
 * Escapes regex special characters in user-supplied search input before it
 * is used inside a MongoDB $regex query.
 *
 * SECURITY: without this, a client can pass a crafted pattern (e.g.
 * "(a+)+$") as a search term and MongoDB will compile/run it as a literal
 * regular expression against every document - this can cause catastrophic
 * backtracking (ReDoS) and hang the query, or otherwise abuse the field as
 * an arbitrary regex rather than a plain text search term.
 */
export const escapeRegex = (str) =>
  typeof str === "string" ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : str;

//Helper for XSS vulnarabilities
export function xssValidator() {
  return Joi.string()
    .trim()
    .custom((value, helpers) => {
      const sanitized = xss(value);
      if (sanitized !== value) {
        return helpers.error("string.invalid", { message: "XSS detected" });
      }

      return sanitized;
    });
}