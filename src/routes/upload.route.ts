import { Router } from "express";
import { cloudinaryMulter, upload } from "../middlewares/upload.middleware";
import { imageCloudinaryUploadController, imageUploadController } from "../controllers/image-upload.controller";

const uploadRouter = Router();

// Route to handle image upload for local storage
// This route is used for local storage and processing of images
uploadRouter.post("/upload", upload.single("image"), imageUploadController);

// Route to handle image upload for Cloudinary
// This route is used for uploading images to Cloudinary
uploadRouter.post("/cloudinary-upload", cloudinaryMulter.single("image"), imageCloudinaryUploadController);

export default uploadRouter;