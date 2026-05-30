import catchError from "../../utils/catchError.js";
import AppError from "../../utils/appError.js";
import productModel from "../../models/Product.js";
import {
  productValidationSchema,
  updateProductSchema,
  queryValidationSchema,
} from "./productValidationSchema.js";

/**
 * Adding new product controller
 */
const addProduct = catchError(async (req, res) => {
  const { error, value } = productValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const {
    name,
    description,
    price,
    discountPrice,
    countInStock,
    sku,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    rating,
    numReviews,
    tags,
    metaTitle,
    metaDescription,
    metaKeywords,
    dimensions,
    weight,
  } = value;

  const product = await productModel.create({
    name,
    description,
    price,
    discountPrice,
    countInStock,
    sku,
    category,
    brand,
    sizes,
    colors,
    collections,
    material,
    gender,
    images,
    isFeatured,
    isPublished,
    rating,
    numReviews,
    tags,
    metaTitle,
    metaDescription,
    metaKeywords,
    dimensions,
    weight,
    user: req.user._id,
  });

  if (!product)
    throw new AppError(
      "Error encountered while creating new product try again later",
      500,
    );

  res.status(201).json(product);
});

/**
 * update an existing product controller
 */
const updateProduct = catchError(async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body);
  console.log(value);

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const product = await productModel.findByIdAndUpdate(req.params.id, value, {
    returnDocument: "after",
  });

  if (!product) throw new AppError("The product not found", 404);
  res.status(200).json(product);
});

/**
 * Deleting an existing product
 */
const deleteProduct = catchError(async (req, res) => {
  const product = await productModel.findByIdAndDelete(req.params.id);
  if (product) {
    res.status(200).json({
      message: `Product ${req.params.id} deleted successfully`,
    });
  } else {
    throw new AppError(`the product ${req.params.id} not found`, 404);
  }
});

/**
 * add many products
 */
const addManyProducts = catchError(async (req, res) => {
  let products = [];

  for (let prod of req.body) {
    const { error, value } = productValidationSchema.validate(prod);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }
    products.push({ ...value, user: req.user.id });
  }

  if (products && products.length > 0) {
    products = await productModel.create(products);
    res.status(201).json({
      products: products,
    });
  } else {
    throw new AppError("Error occured while inserting the products", 500);
  }
});

/**
 * getAllProducts
 */
const getAllProducts = catchError(async (req, res) => {
  const query = {};
  const { error, value } = queryValidationSchema.validate(req.query);

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }
  const {
    collection,
    size,
    color,
    gender,
    minPrice,
    maxPrice,
    sortBy,
    search,
    category,
    material,
    brand,
    limit,
  } = value;

  /**
   * Filter Functionality or logic
   */
  if (collection && collection !== "all") {
    query.collections = { $in: [collections] };
  }

  if (category && category.toLowerCase() !== "all") {
    query.category = category;
  }
  if (gender) {
    query.gender = gender;
  }
  if (brand) {
    query.brand = { $in: brand.split(",") };
  }
  if (material) {
    query.material = { $in: material.split(",") };
  }
  if (size) {
    query.sizes = { $in: size.split(",") };
  }
  if (color) {
    query.colors = { $in: [color] };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search) {
    Object.assign(query, {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
  }

  let sort = {};
  if (sortBy) {
    switch (sortBy) {
      case "priceAsc":
        sort = { price: 1 };
        break;
      case "priceDesc":
        sort = { price: -1 };
        break;
      case "popularity":
        sort = { price: -1 };
        break;
      default:
        delete query.sort;
        break;
    }
  }

  console.log(query);

  const products = await productModel
    .find(query)
    .sort(sort)
    .limit(Number(limit) || 0);

  if (products && products.length > 0) {
    res.status(200).json(products);
  } else {
    throw new AppError("No products found", 404);
  }
});

/**
 * Get one product controller
 */
const getProduct = catchError(async (req, res) => {
  const product = await productModel.findById(req.params.id);

  if (product) {
    res.status(200).json(product);
  } else {
    throw new AppError("There is no product with this ID", 404);
  }
});

/**
 * Get similar products controller
 */
const getSimilarProducts = catchError(async (req, res) => {
  const product = await productModel.findById(req.params.id);

  if (product) {
    const similarProducts = await productModel
      .find({
        _id: { $ne: id },
        gender: product.gender,
        category: product.category,
      })
      .limit(4);

    if (similarProducts && similarProducts.length > 0) {
      res.status(200).res(similarProducts);
    } else {
      throw new AppError("There are no similar products available", 404);
    }
  } else {
    throw new AppError("There is no product with this ID", 404);
  }
});

/**
 * Get the product with the highest rating controller
 */
const getBestSeller = catchError(async (req, res) => {
  const product = await productModel.find().sort({ rating: -1 }).limit(1);
  if (!product) throw new AppError("No product found", 404);

  res.status(200).json(product);
});
/**
 * Get the latest 8 Products controller
 */
const getNewArrivals = catchError(async (req, res) => {
  const products = await productModel.find().sort({ createdAt: -1 }).limit(8);
  if (!products || products.length == 0)
    throw new AppError("No product found", 404);

  res.status(200).json(products);
});

export {
  addProduct,
  updateProduct,
  deleteProduct,
  addManyProducts,
  getAllProducts,
  getProduct,
  getSimilarProducts,
  getBestSeller,
  getNewArrivals,
};
