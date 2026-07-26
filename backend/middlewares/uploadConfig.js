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
 *
 * SECURITY: previously only file size was restricted - any content type
 * could be uploaded and pushed to Cloudinary under an admin-controlled
 * public URL. Restrict to actual image types.
 */
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { files: 1, fileSize: 6291456 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      const err = new Error(
        "Only image files (jpeg, png, webp, gif, avif) are allowed",
      );
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

export const uploadImgMidleware = upload.single("image");
