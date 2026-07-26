import Joi from "joi";

export const userValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .pattern(/^[A-Za-z]+$/)
    .required()
    .messages({
      "any.required": "User name is required",
      "string.empty": "User name is required",
      "string.pattern.base": "User name may only contain letters",
    }),
  email: Joi.string()
    .trim()
    .email()
    .pattern(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)
    .required()
    .messages({
      "any.required": "Email is required",
      "string.empty": "Email is required",
      "string.pattern.base":
        "Invalid email format. Must be in the form local@domain.tld without spaces or invalid characters.",
    }),
  password: Joi.string().trim().min(8),
  // .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/)
  // .messages({
  //   "any.required": "Password is required",
  //   "string.empty": "Password is required",
  //   "string.pattern.base":
  //     "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (#?!@$ %^&*-).",
  // }),
  resetPasswordToken: Joi.string().trim().optional(),
  resetPasswordExpire: Joi.date().optional(),
  role: Joi.string().trim().valid("admin", "customer").default("customer"),
});

/**
 * SECURITY: schema used by the PUBLIC /register endpoint. Derived from
 * userValidationSchema but explicitly forbids `role` - registration should
 * never be able to set a role at all, even to the "customer" default.
 *
 * This exists as a safety net independent of what the register controller
 * currently does with the field: today the controller only destructures
 * `{ name, email, password }` and ignores `value.role`, but relying on that
 * alone is fragile - a future refactor to something like
 * `userModel.create(value)` would silently reopen a privilege-escalation
 * path. Rejecting `role` at the validation layer closes that off for good.
 * Only admin-only endpoints (addNewUser / updateUser) should ever accept a
 * `role` field, via userValidationSchema/userUpdateValidation below.
 */
export const publicUserValidationSchema = userValidationSchema.fork(
  ["role"],
  (schema) => schema.forbidden(),
);

export const forgotPasswordValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .pattern(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)
    .required()
    .messages({
      "any.required": "Email is required",
      "string.empty": "Email is required",
      "string.pattern.base":
        "Invalid email format. Must be in the form local@domain.tld without spaces or invalid characters.",
    }),
});

export const resetPasswordValidationSchema = Joi.object({
  password: Joi.string().trim().min(8).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
  }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

export const userUpdateValidation = userValidationSchema
  .fork(
    [
      "name",
      "email",
      "password",
      "role",
      "resetPasswordToken",
      "resetPasswordExpire",
    ],
    (schema) => schema.optional().empty("").empty(null).empty(undefined),
  )
  .prefs({ stripUnknown: true });
