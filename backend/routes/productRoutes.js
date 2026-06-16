import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addManyProducts,
  getAllProducts,
  getProduct,
  getSimilarProducts,
  getBestSeller,
  getNewArrivals
} from "../controllers/product/productController.js";

const router = express.Router();


//@route GET /api/products/best-seller
//@desc Retrieve the product with the highest rating
//@access Public
router.get("/best-seller", getBestSeller)

//@route GET /api/products/new-arrivals
//@desc Retrieve latest 8 products =>> Creation date
//@access Public
router.get("/new-arrivals", getNewArrivals)

//@route GET /api/products
//@desc Get all products with optional query filters
//@access Public
router.get("/", getAllProducts);

//@route GET /api/products/:id
//@desc Get a product with its ID
//@access Public
router.get("/:id", getProduct);

//@route GET /api/products/similar/:id
//@desc Retrieve similar products based on the current product's gender and category
//@access Public
router.get("/similar/:id", getSimilarProducts)




export default router;
