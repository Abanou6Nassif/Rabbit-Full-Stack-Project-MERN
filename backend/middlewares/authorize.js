import AppError from "../utils/appError.js";
import catchError from "../utils/catchError.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json("Not Authorized");
    }
    next();
  };
};
