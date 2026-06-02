import checkoutModel from "../../models/Checkout.js";
import cartModel from "../../models/Cart.js";
import productModel from "../../models/Product.js";
import orderModel from "../../models/Order.js";
import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";

/**
 * Create a new checkout session
 */
export const checkoutSession = catchError(async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems && checkoutItems.length === 0)
    throw new AppError("no items in checkout", 400);

  const newCheckout = await checkoutModel.create({
    user: req.user._id,
    checkoutItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  console.log(`Checkout created for user: ${req.user._id}`);

  res.status(201).json(newCheckout);
});

/**
 * Update checkout to mark as paid after successful payment
 */
export const updateCheckoutPayment = catchError(async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  const checkout = await checkoutModel.findById(req.params.id);
  if (!checkout) throw new AppError("No checkout session is found", 404);

  if (paymentStatus === "paid") {
    checkout.isPaid = true;
    checkout.paymentStatus = paymentStatus;
    checkout.paymentDetails = paymentDetails;
    checkout.paidAt = Date.now();
    await checkout.save();

    res.status(200).json(checkout);
  } else {
    throw new AppError("Invalid Payment", 400);
  }
});

/**
 * Finalize checkout and convert to an order after payment confirmation
 */
export const finalizeCheckout = catchError(async (req, res) => {
  const checkout = await checkoutModel.findById(req.params.id);
  if (!checkout) throw new AppError("No checkout session is found", 404);

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

    //Delete the cart associated with the user
    await cartModel.findOneAndDelete({ user: req.user.id });

    res.status(201).json(finalOrder);
  } else if (checkout.isFinalized) {
    throw new AppError("Checkout already finalized", 400);
  } else {
    throw new AppError("Checkout is not paid", 400);
  }
});
