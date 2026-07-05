import jwt from "jsonwebtoken";
import userModel from "../models/user/User.js";
import catchError from "../utils/catchError.js";
import AppError from "../utils/appError.js";
import { getAccessTokenSecret } from "../utils/tokenConfig.js";

/**
 * authentication middleware
 */
export const authenticate = catchError(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) throw new AppError("Please login first", 401);

  let decoded;

  try {
    decoded = jwt.verify(token, getAccessTokenSecret());
  } catch {
    throw new AppError("Not authenticated", 401);
  }

  if (!decoded) throw new AppError("Not authenticated", 401);
  //Excluding the password to be not sended to the next middleware
  req.user = await userModel.findById(decoded.user.id).select("-password");
  
  next();
});
