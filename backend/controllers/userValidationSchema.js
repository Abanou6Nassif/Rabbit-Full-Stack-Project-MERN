import Joi from "joi";

export const userValidationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .pattern(/^[A-Za-z]+$/)
    .required(),
  email: Joi.string()
    .email()
    .pattern(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)
    .required(),
  password: Joi.string()
    .min(8),
    // .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/),
  role: Joi.string().valid("admin", "customer").default("customer"),
});
