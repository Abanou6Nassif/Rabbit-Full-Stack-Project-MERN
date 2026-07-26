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

  // SECURITY/STABILITY: the token can still be cryptographically valid
  // after the account it belongs to has been deleted (e.g. by an admin,
  // or the user themself). Without this check, req.user would be `null`
  // here and any downstream middleware/controller that reads req.user.role
  // or req.user._id (e.g. `authorize`) would throw an unhandled
  // TypeError instead of a clean 401.
  if (!req.user) throw new AppError("Your account no longer exists", 401);

  next();
});

/**
 * Soft/optional authentication middleware.
 *
 * Used on routes (like /api/cart) that must work for both guests and
 * logged-in users. If a valid accessToken cookie is present, req.user is
 * populated with the real DB user (so controllers can use req.user._id as
 * the source of truth for "whose cart is this"). If the cookie is
 * missing/invalid/expired, the request is treated as an anonymous guest
 * instead of being rejected - it just never sets req.user.
 *
 * SECURITY: this exists so controllers never have to fall back to trusting
 * a `userId` field sent by the client in the request body/query, which
 * would let anyone act on another user's data just by supplying their id.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decoded = jwt.verify(token, getAccessTokenSecret());

      if (decoded?.user?.id) {
        req.user = await userModel.findById(decoded.user.id).select("-password");
      }
    }
  } catch {
    // Invalid/expired token - treat as anonymous guest, don't block the request.
  }

  next();
};
