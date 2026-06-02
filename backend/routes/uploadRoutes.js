import express from "express";
import { uploadImage } from "../controllers/upload/uploadController.js";
import { uploadImgMidleware } from "../middlewares/uploadConfig.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

//@route /api/upload
//@desc upload image route
//@access Private/Admin
router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadImgMidleware,
  uploadImage,
);

export default router;
