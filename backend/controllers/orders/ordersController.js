import catchError from "../../utils/catchError.js";
import orderModel from "../../models/Order.js";
import AppError from "../../utils/appError.js";

/**
 * Get logged-in user's orders
 */
export const getUserOrders = catchError(async (req, res) => {
  // Find orders for the authenticated user
  const orders = await orderModel.find({ user: req.user._id }).sort({
    createdAt: -1,
  }); //Sort by most recent orders
  if (!orders || orders.length === 0)
    throw new AppError("No previous orders available", 404);

  res.status(200).json(orders);
});

/**
 * Get orders details by ID
 */
export const getOrderDetails = catchError(async (req, res) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("user", "name email");
  if (!order) throw new AppError("The order not found", 404);
  res.status(200).json(order);
});
