import express from "express";
import { addToCart, updateCartProductQty } from "../controllers/cart/cartController.js";

const router = express.Router();

//@route Post /api/cart
//@desc creating the cart and adding to it or update an existing one
//@access Public
router.post("/", addToCart);

//@route PUT /api/cart
//@desc Updating product quantity in the cart for a guest or logged-in user
//@access Public
router.put("/", updateCartProductQty);

export default router;
