import catchError from "../../utils/catchError.js";
import productModel from "../../models/Product.js";
import AppError from "../../utils/appError";

export const getAllProducts = catchError(async (req, res) => {
  const products = await productModel.find({});
  if (!products || products.length === 0)
    throw new AppError("No products found", 404);

  res.status(200).json(products);
});
