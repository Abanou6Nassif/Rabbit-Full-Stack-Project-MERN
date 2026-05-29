import express from "express";
import { addToCart } from "../controllers/cart/cartController.js";

const router = express.Router();

//@route Post /api/cart
//@desc creating the cart and adding to it or update an existing one
//@access Public
router.post("/", addToCart)


export default router