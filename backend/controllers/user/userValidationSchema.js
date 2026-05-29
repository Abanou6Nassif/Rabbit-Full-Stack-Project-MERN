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
  role: Joi.string().trim().valid("admin", "customer").default("customer"),
});
