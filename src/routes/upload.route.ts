import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import { imageUploadController } from "../controllers/image-upload.controller";

const router = Router();

router.post("/upload", upload.single("image"), imageUploadController);