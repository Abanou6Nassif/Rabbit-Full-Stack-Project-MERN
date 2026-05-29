import userModel from "../../models/User.js";
import jwt from "jsonwebtoken";
import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";
import { userValidationSchema } from "./userValidationSchema.js";

/**
 * register controller
 */
const register = catchError(async (req, res) => {
  let { error, value } = userValidationSchema.validate(req.body, {
    allowUnknown: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { name, email, password } = value;

  let user = await userModel.findOne({ email });

  if (user) throw new AppError("User already exists", 400);

  user = await userModel.create({ name, email, password });

  const payload = { user: { id: user._id, role: user.role } };
  try {
    const token = user.generateToken(res, payload);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }

  res.status(201).json({
    message: "Account created successfully",
  });
});

/**
 * login controller
 */
const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  // find the user in the DB
  let user = await userModel.findOne({ email });

  if (!user) throw new AppError("Invalid Credentials", 400);

  const isMatch = await user.matchPassword(password);

  if (!isMatch) throw new AppError("Invalid Credentials", 400);

  const payload = { user: { id: user._id, role: user.role } };
  try {
    const token = user.generateToken(res, payload);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }

  res.status(201).json({
    message: "Logged in Successfully",
  });
});

/**
 * profile controller
 */
const profile = catchError(async (req, res) => {
  res.status(200).json(req.user);
});



export { register, login, profile };
