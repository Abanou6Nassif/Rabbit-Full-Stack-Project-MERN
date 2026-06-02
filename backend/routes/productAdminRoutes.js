import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { getAllProducts } from "../controllers/product/productController.js";

const router = express.Router();

/**
 * @route GET /api/admin/products
 * @desc Get all products (Admin only)
 * @access Private/Admin
 */
router.get("/", authenticate, authorize("admin"), getAllProducts)














export default router;