import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getOrderDetails, getUserOrders } from "../controllers/orders/ordersController.js";

const router = express.Router()


//@route GET /api/orders/my-orders
//@desc Get logged-in user's orders
//@access Private
router.get("/my-orders", authenticate,getUserOrders)

//@route GET /api/orders/:id
//@desc Get orders details by ID
//@access Private
router.get("/:id", authenticate, getOrderDetails)



export default router