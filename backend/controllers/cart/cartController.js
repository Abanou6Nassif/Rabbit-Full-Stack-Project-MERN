import catchError from "../../utils/catchError.js";
import { cartModel } from "../../models/Cart.js";
import productModel from "../../models/Product.js";
import AppError from "../../utils/appError.js";
import { v6 as uuidV6 } from "uuid";
import { cartValidationSchema } from "./cartValidationSchema.js";

/**
 * creating the cart and adding to it or update an existing one
 */

const getCart = async (userId, guestId) => {
  if (userId) {
    return await cartModel.findOne({ user: userId });
  } else if (guestId) {
    return await cartModel.findOne({ guestId: guestId });
  } else {
    return null;
  }
};

/**
 * Adding product to cart for a guest or logged-in user
 */
export const addToCart = catchError(async (req, res) => {
  const { error, value } = cartValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { productId, size, color, quantity, guestId, userId } = value;

  const product = await productModel.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  let cart = await getCart(userId, guestId);

  //add the item to the existing cart
  if (cart) {
    const productIndex = cart.products.findIndex(
      (prod) =>
        prod.productId.toString() === productId &&
        prod.size === size &&
        prod.color === color,
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({
        productId,
        name: product.name,
        image: product.images[0].url,
        price: product.price,
        size,
        color,
        quantity,
      });
    }

    cart.totalPrice = cart.products.reduce((total, prod) => {
      return total + prod.quantity * prod.price;
    }, 0);
    cart = await cart.save();
    if (!cart)
      throw new AppError(
        "Error occured while adding the product to the cart please try again later",
        500,
      );
    return res.status(201).json(cart);
  } else {
    /**
     * Create new cart for the guest or user
     */
    const newCart = await cartModel.create({
      user: userId ? userId : undefined,
      guestId: guestId ? guestId : `guest_${uuidV6()}`,
      products: [
        {
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        },
      ],
      totalPrice: quantity * product.price,
    });

    if (!newCart)
      throw new AppError(
        "Error occured while adding the product to the cart please try again later",
        500,
      );
    return res.status(201).json(newCart);
  }
});

/**
 * Updating product quantity in the cart for a guest or logged-in user
 */
export const updateCartProductQty = catchError(async (req, res) => {
  const { error, value } = cartValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { productId, size, color, quantity, guestId, userId } = value;

  let cart = await getCart(userId, guestId);
  console.log(cart);

  if (!cart) throw new AppError("Cart not found", 404);

  const productIndex = cart.products.findIndex(
    (prod) =>
      prod.productId.toString() === productId &&
      prod.color === color &&
      prod.size === size,
  );

  if (productIndex > -1) {
    if (quantity > 0) {
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.splice(productIndex, 1);
    }
  } else {
    throw new AppError("Product not found", 404);
  }

  cart.totalPrice = cart.products.reduce((total, prod) => {
    return total + prod.quantity * prod.price;
  }, 0);

  cart = await cart.save();
  console.log(cart, "L147");

  res.status(200).json(cart);
});
