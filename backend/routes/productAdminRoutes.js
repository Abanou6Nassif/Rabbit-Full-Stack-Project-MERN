import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { addManyProducts, addProduct, deleteProduct, getAllProducts, updateProduct } from "../controllers/product/productController.js";

const router = express.Router();

/**
 * @route GET /api/admin/products
 * @desc Get all products (Admin only)
 * @access Private/Admin
 */
router.get("/", authenticate, authorize("admin"), getAllProducts);

//@route POST /api/admin/products
//@desc Create a new Product
//@access Private/Admin
router.post("/", authenticate, authorize("admin"), addProduct);

//@route PATCH /api/admin/products/:id
//@desc Update an existing product ID
//@access Private/Admin
router.patch("/:id", authenticate, authorize("admin"), updateProduct);

//@route DELETE /api/admin/products/:id
//@desc Delete a product by its ID
//@access Private/Admin
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

//@route POST /api/admin/products/addmany
//@desc Delete a product by its ID
//@access Private/Admin
router.post("/addmany", authenticate, authorize("admin"), addManyProducts);

export default router;
