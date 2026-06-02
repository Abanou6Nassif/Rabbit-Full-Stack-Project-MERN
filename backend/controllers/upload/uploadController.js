import AppError from "../../utils/appError.js";
import catchError from "../../utils/catchError.js";
import cloudinary from "../../middlewares/uploadConfig.js";
import streamifier from "streamifier";

export const uploadImage = catchError(async (req, res) => {
  if (!req.file) throw new AppError("No file Uploaded");

  console.log(req.file);

  // Function to handle the stream upload to Cloudinary
  const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: req.file.originalname,
          overwrite: true,
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        },
      );

      /**
       * stream  =  a funnel (an object) that has these functions
       * 1. write(chunk){...} // called repeatedly as data chunks arrive
       * 2. end(){...} // called when all data is sent — triggers the upload
       * 3. on(event, fn){...} // listen for events like 'error'
       * // ... other stream internals
       */

      //Use streamifier to convert file buffer to a stream
      streamifier.createReadStream(fileBuffer).pipe(stream);
      /**
       * here .pipe() pours the buffer into the funnel (stream object)
       */
    });
  };

  //call the stramUpload function
  const result = await streamUpload(req.file.buffer);

  res.status(201).json({ imageURL: result.secure_url });
});
