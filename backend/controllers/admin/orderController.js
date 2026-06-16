import catchError from "../../utils/catchError.js";
import orderModel from "../../models/Order.js";
import AppError from "../../utils/appError.js";

/**
 * Get all the orders for the admin
 */
export const getAllOrers = catchError(async (req, res) => {
  const orders = await orderModel.find({}).populate("user", "name email");
  if (!orders || orders.length === 0)
    throw new AppError("No orders found", 404);
  res.status(200).json(orders);
});

/**
 * Update the order status
 */
export const updateOrderStatus = catchError(async (req, res) => {
  const order = await orderModel.findById(req.params.id).populate("user", "name");

  if (order) {
    order.status = req.body.status || order.status;
    order.isDelivered =
      req.body.status === "Delivered" ? true : order.isDelivered;
    order.deliveredAt =
      req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

    const updatedOrder = await order.save();
    console.log(updatedOrder);
    
    res.status(200).json(updatedOrder);
  } else {
    throw new AppError("Order not found", 404);
  }

  //   const order = await orderModel.findByIdAndUpdate(req.params.id, {
  //     status: req.body.status || status,
  //     isDelivered: req.body.status === "Delivered" ? true : isDelivered,
  //     deliveredAt: req.body.status === "Delivered" ? Date.now() : deliveredAt,
  //   });

  //   if (!order) throw new AppError("Order not found", 404);

  //   res.status(200).json(order);
});

/**
 * Delete an order
 */
export const deleteOrder = catchError(async (req, res) => {
  const deletedOrder = await orderModel.findByIdAndDelete(req.params.id);
  if (!deletedOrder) throw new AppError("Order not found", 404);
  res.status(200).json(deletedOrder);
});
