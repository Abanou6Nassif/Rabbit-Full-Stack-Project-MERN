import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { addNewUser, deleteUser, getAllUsers, updateUser } from "../controllers/admin/adminController.js";

const router = express.Router();

//@route GET /api/admin/users
//@desc Get all users (Admin only)
//@access Private/Admin
router.get("/", authenticate, authorize("admin"), getAllUsers);

//@route POST /api/admin/users
//@desc Add a new user (Admin only)
//@access Private/Admin
router.post("/", authenticate, authorize("admin"), addNewUser);

//@route PATCH /api/admin/users/:id
//@desc Update user info (Admin only) - Name, email and role
//@access Private/Admin
router.patch("/:id", authenticate, authorize("admin"), updateUser);

//@route DELETE /api/admin/users/:id
//@desc Delete a user
//@access Private/Admin
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default router;
