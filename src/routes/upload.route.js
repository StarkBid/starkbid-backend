"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const image_upload_controller_1 = require("../controllers/image-upload.controller");
const uploadRouter = (0, express_1.Router)();
// Route to handle image upload for local storage
// This route is used for local storage and processing of images
uploadRouter.post("/upload", upload_middleware_1.upload.single("image"), image_upload_controller_1.imageUploadController);
// Route to handle image upload for Cloudinary
// This route is used for uploading images to Cloudinary
uploadRouter.post("/cloudinary-upload", upload_middleware_1.cloudinaryMulter.single("image"), image_upload_controller_1.imageCloudinaryUploadController);
exports.default = uploadRouter;
