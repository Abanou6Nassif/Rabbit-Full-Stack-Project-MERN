import express from "express";
import {register, login, profile} from "../controllers/userControllers.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
const router = express.Router();

//@route POST /api/users/register
//@desc Register a new user
//@access Public
router.post("/register", register);

//@route POST /api/users/login
//@desc Login user
//@access Public
router.post("/login", login)

//@route GET /api/users/profile
//@desc Get logged-in user's profile (Protected Route)
//@access Public
router.get("/profile", authenticate, profile)

export default router;
