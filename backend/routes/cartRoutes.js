import express from "express";
import {
  addToCart,
  deleteCartProduct,
  getCartDetails,
  mergeCart,
  updateCartProductQty,
} from "../controllers/cart/cartController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

//@route Post /api/cart
//@desc creating the cart and adding to it or update an existing one
//@access Public
router.post("/", addToCart);

//@route PATCH /api/cart
//@desc Updating product quantity in the cart for a guest or logged-in user
//@access Public
router.patch("/", updateCartProductQty);

//@route Delete /api/cart
//@desc Deleting a product from the cart for a guest or logged-in user
//@access Public
router.delete("/", deleteCartProduct);

//@route GET /api/cart
//@desc Retrieve or get guest user's or logged-in user's Cart
//@access Public
router.get("/", getCartDetails);

//@route POST /api/cart/merge
//@desc Merge guest cart into user cart on login
//@access Private
router.post("/merge", authenticate, mergeCart);

export default router;
