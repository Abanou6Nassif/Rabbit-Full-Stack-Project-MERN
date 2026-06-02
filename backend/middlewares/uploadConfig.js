import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

/**
 * Cloudinary Configuration
 */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;

/**
 * Multer setup using memory storage
 */
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { files: 1, fileSize: 6291456 } });

export const uploadImgMidleware = upload.single("image");
