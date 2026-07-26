import userModel from "../../models/user/User.js";
import AppError from "../../utils/appError.js";
import catchError from "../../utils/catchError.js";
import {
  userUpdateValidation,
  userValidationSchema,
} from "../../models/user/userValidationSchema.js";

/**
 * Get all users
 */
export const getAllUsers = catchError(async (req, res) => {
  const users = await userModel.find().select("-password");

  if (!users || users.length === 0) throw new AppError("No users found");
  res.status(200).json(users);
});

/**
 * add new user
 */

export const addNewUser = catchError(async (req, res) => {
  const { error, value } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }
  const { name, email, password, role } = value;

  //check whether the user exist or not
  let user = await userModel.findOne({ email });
  if (user) throw new AppError("the user already exists", 400);

  user = await userModel.create({ name, email, password, role });

  // Re-fetch without the password hash rather than returning the
  // just-created document directly (which still carries the bcrypt hash
  // in memory since User schema doesn't mark `password` as select:false).
  const safeUser = await userModel.findById(user._id).select("-password");

  res.status(201).json({
    message: "User created successfully",
    user: safeUser,
  });
});

/**
 * Update user info (Admin only)
 */
export const updateUser = catchError(async (req, res) => {
  let user = await userModel.findById(req.params.id);
  if (!user) throw new AppError("The user not found", 404);

  const { error, value } = userUpdateValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }
  const { name, email, role } = value;

  // SAFETY: never allow the last remaining admin to be demoted - that
  // would lock everyone out of the admin panel with no way back in.
  if (user.role === "admin" && role && role !== "admin") {
    const adminCount = await userModel.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new AppError(
        "Cannot demote the last remaining admin account",
        400,
      );
    }
  }

  user = await userModel
    .findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
      },
      { returnDocument: "after" },
    )
    .select("-password");

  res.status(200).json({
    message: "The user updated sccessfully",
    user: user,
  });
});

/**
 * Delete a user
 */
export const deleteUser = catchError(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  // SAFETY: don't let an admin delete their own account through this
  // endpoint - that's an easy way to accidentally lock yourself out.
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError(
      "You cannot delete your own account. Ask another admin to do it.",
      400,
    );
  }

  // SAFETY: never allow the last remaining admin to be deleted - that
  // would lock everyone out of the admin panel with no way back in.
  if (user.role === "admin") {
    const adminCount = await userModel.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new AppError(
        "Cannot delete the last remaining admin account",
        400,
      );
    }
  }

  await userModel.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "User deleted successflly",
  });
});
