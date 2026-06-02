import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { deleteOrder, getAllOrers, updateOrderStatus } from "../controllers/admin/orderController.js";
const router = express.Router();

/**
 * @route GET /api/admin/orders
 * @desc Get all orders (Admin only)
 * @access Private/Admin
 */
router.get("/", authenticate, authorize("admin"), getAllOrers);


/**
 * @route PATCH /api/admin/orders/:id
 * @desc Update order status (Admin only)
 * @access Private/Admin
 */
router.patch("/:id", authenticate, authorize("admin"), updateOrderStatus);


/**
 * @route DELETE /api/admin/orders/:id
 * @desc  Delete an order
 * @access Private/Admin
 */
router.delete("/:id", authenticate, authorize("admin"), deleteOrder);

export default router;
