import express from "express";
import {
  register,
  verifyEmail,
  login,
  profile,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/user/userControllers.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authLimiterMiddleware } from "../middlewares/rateLimiter.js";
const router = express.Router();

//@route POST /api/users/register
//@desc Register a new user
//@access Public
router.post("/register", authLimiterMiddleware, register);

//@route POST /api/users/verify-email/:token
//@desc Verify email and activate account
//@access Public
router.post("/verify-email/:token", authLimiterMiddleware, verifyEmail);

//@route POST /api/users/login
//@desc Login user
//@access Public
router.post("/login", authLimiterMiddleware, login);

//@route GET /api/users/profile
//@desc Get logged-in user's profile (Protected Route)
//@access Public
router.get("/profile", authenticate, profile);

//@route POST /api/users/logout
//@desc logout user
//@access Public
router.post("/logout", logout);

//@route POST /api/users/forgot-password
//@desc Send a password reset link
//@access Public
router.post("/forgot-password", authLimiterMiddleware, forgotPassword);

//@route PUT /api/users/reset-password/:token
//@desc Reset user password
//@access Public
router.put("/reset-password/:token", authLimiterMiddleware, resetPassword);

export default router;
