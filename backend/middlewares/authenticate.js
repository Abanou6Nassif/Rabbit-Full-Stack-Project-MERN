import jwt from "jsonwebtoken";
import userModel from "../models/User.js";
import catchError from "../utils/catchError.js";
import AppError from "../utils/appError.js";

/**
 * authentication middleware
 */
export const authenticate = catchError(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) throw new AppError("Please login first", 401);

  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

  if (!decoded) throw new AppError("Not authenticated", 401);
  //Excluding the password to be not sended to the next middleware
  req.user = await userModel.findById(decoded.user.id).select("-password");
  next();
});

