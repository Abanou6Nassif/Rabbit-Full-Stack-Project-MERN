import checkoutModel from "../../models/checkout/Checkout.js";
import cartModel from "../../models/cart/Cart.js";
import productModel from "../../models/product/Product.js";
import orderModel from "../../models/order/Order.js";
import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";
import { UpdateCheckoutValidationSchema } from "../../models/checkout/checkoutValidationSchema.js";
import { verifyPayPalPayment } from "../../utils/paypal.js";

/**
 * Ensures the checkout being acted on actually belongs to the requesting
 * user (unless they're an admin). Prevents one user from paying/finalizing
 * another user's checkout just by guessing/knowing its id (IDOR).
 */
const assertOwnsCheckout = (checkout, req) => {
  const isOwner = checkout.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not authorized to access this checkout", 403);
  }
};

/**
 * Create a new checkout session
 */
export const checkoutSession = catchError(async (req, res) => {
  const { error, value } = UpdateCheckoutValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { checkoutItems, shippingAddress, paymentMethod } = value;

  if (!checkoutItems || checkoutItems.length === 0)
    throw new AppError("no items in checkout", 400);

  // SECURITY: never trust price/name/image sent by the client - those are
  // easy to tamper with in the browser before the request is sent. Re-fetch
  // every product from the DB and rebuild the checkout items + total here,
  // server-side, exactly like cartController.addToCart already does.
  const verifiedItems = [];
  let totalPrice = 0;

  for (const item of checkoutItems) {
    const product = await productModel.findById(item.productId);

    if (!product) {
      throw new AppError(
        `Product ${item.productId} is no longer available`,
        400,
      );
    }

    if (
      typeof product.countInStock === "number" &&
      product.countInStock < item.quantity
    ) {
      throw new AppError(`Not enough stock for "${product.name}"`, 400);
    }

    const verifiedPrice = product.discountPrice ?? product.price;

    verifiedItems.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: verifiedPrice,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    });

    totalPrice += verifiedPrice * item.quantity;
  }

  const newCheckout = await checkoutModel.create({
    user: req.user._id,
    checkoutItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  console.log(`Checkout created for user: ${req.user._id}`);

  res.status(201).json(newCheckout);
});

/**
 * Update checkout to mark as paid after successful payment.
 *
 * SECURITY: this used to trust `req.body.paymentStatus === "paid"` directly,
 * which let anyone mark their own checkout as paid without paying anything.
 * It now requires the client to hand us the PayPal order id it received
 * from the PayPal button, and we independently verify with PayPal's own API
 * that the order was actually captured and for the correct amount, before
 * ever setting isPaid = true.
 */
export const updateCheckoutPayment = catchError(async (req, res) => {
  const checkout = await checkoutModel.findById(req.params.id);
  if (!checkout) throw new AppError("No checkout session is found", 404);

  assertOwnsCheckout(checkout, req);

  if (checkout.isPaid) {
    // Already verified previously - idempotent response, no re-verification.
    return res.status(200).json(checkout);
  }

  if ((checkout.paymentMethod || "").toLowerCase() !== "paypal") {
    throw new AppError(
      "Automatic payment verification is only supported for PayPal at this time",
      400,
    );
  }

  const orderId =
    req.body?.paymentDetails?.id || req.body?.paymentDetails?.orderID;

  if (!orderId || typeof orderId !== "string") {
    throw new AppError("Missing PayPal order id in paymentDetails.id", 400);
  }

  const { capture } = await verifyPayPalPayment(orderId, checkout.totalPrice);

  checkout.isPaid = true;
  checkout.paymentStatus = "completed";
  checkout.paymentDetails = {
    provider: "paypal",
    orderId,
    captureId: capture.id,
    amount: capture.amount,
  };
  checkout.paidAt = Date.now();
  await checkout.save();

  res.status(200).json(checkout);
});

/**
 * Finalize checkout and convert to an order after payment confirmation
 */
export const finalizeCheckout = catchError(async (req, res) => {
  const checkout = await checkoutModel.findById(req.params.id);
  if (!checkout) throw new AppError("No checkout session is found", 404);

  assertOwnsCheckout(checkout, req);

  if (checkout.isPaid && !checkout.isFinalized) {
    //Create final order based on the checkout details
    const finalOrder = await orderModel.create({
      user: checkout.user,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: "paid",
      paymentDetails: checkout.paymentDetails,
    });

    // Mark checkout as finalized
    ((checkout.isFinalized = true), (checkout.finalizedAt = Date.now()));
    await checkout.save();

    //Delete the cart associated with the user who owns this checkout
    await cartModel.findOneAndDelete({ user: checkout.user });

    res.status(201).json(finalOrder);
  } else if (checkout.isFinalized) {
    throw new AppError("Checkout already finalized", 400);
  } else {
    throw new AppError("Checkout is not paid", 400);
  }
});
