import catchError from "../../utils/catchError.js";
import orderModel from "../../models/order/Order.js";
import AppError from "../../utils/appError.js";

/**
 * Get logged-in user's orders
 */
export const getUserOrders = catchError(async (req, res) => {
  // Find orders for the authenticated user
  const orders = await orderModel.find({ user: req.user._id }).sort({
    createdAt: -1,
  }); //Sort by most recent orders
  if (!orders || orders.length === 0) {
    return res.status(200).json([]);
  }

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

  // SECURITY: previously any authenticated user could view ANY order by id
  // (IDOR) - shipping address, items, and payment details included. Only
  // the order's owner or an admin may view it.
  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not authorized to view this order", 403);
  }

  res.status(200).json(order);
});
