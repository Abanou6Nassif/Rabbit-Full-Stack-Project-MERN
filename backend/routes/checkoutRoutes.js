import express from "express";
import {authenticate} from "../middlewares/authenticate.js"
import { checkoutSession, finalizeCheckout, updateCheckoutPayment } from "../controllers/checkout/checkoutController.js";


const router = express.Router()

//@route POST /api/checkout
//@desc Create a new checkout session
//@access Private >> authenticate
router.post("/", authenticate, checkoutSession)

//@route PATCH /api/checkout/:id/pay
//@desc Update checkout to mark as paid after successful payment
//@access Private >> authenticate
router.patch("/:id/pay", authenticate, updateCheckoutPayment)


//@route POST /api/checkout/:id/finalize
//@desc Finalize checkout and convert to an order after payment confirmation
//@access Private >> authenticate
router.post("/:id/finalize", authenticate, finalizeCheckout)


export default router;