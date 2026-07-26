import Joi from "joi";

export const subscribeValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .pattern(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)
    .required()
    .messages({
      "any.required": "Email is required",
      "string.empty": "Email is required",
      "string.pattern.base":
        "Invalid email format. Must be in the form local@domain.tld without spaces or invalid characters.",
    }),
}).prefs({ stripUnknown: true });
