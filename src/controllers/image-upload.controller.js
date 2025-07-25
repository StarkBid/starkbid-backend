"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageCloudinaryUploadController = exports.imageUploadController = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const image_service_1 = require("../services/image.service");
const cache_1 = require("../services/cache");
const cloudinary_service_1 = require("../services/cloudinary.service");
const imageUploadController = async (req, res) => {
    const filePath = req.file?.path;
    const baseName = req.body.logical_name || path_1.default.parse(req.file.filename).name;
    const outputDir = path_1.default.join(__dirname, "..", "..", "uploads");
    // invalidate old imaages and cache
    await (0, image_service_1.invalidateLocalImages)(baseName); // delete old resized images
    await (0, cache_1.invalidateCachedImage)(`image:${baseName}`); // invalidate cache
    const optimizedPaths = await (0, image_service_1.optimizeImage)(filePath, outputDir, baseName);
    // Convert absolute paths to relative URLs
    const publicPaths = {};
    Object.entries(optimizedPaths).forEach(([size, absPath]) => {
        publicPaths[size] = `${process.env.APP_URL}/cdn/${path_1.default.basename(absPath)}`;
    });
    await (0, cache_1.setCachedImage)(`image:${baseName}`, JSON.stringify(publicPaths));
    res.json({ success: true, images: publicPaths });
    return;
};
exports.imageUploadController = imageUploadController;
const imageCloudinaryUploadController = async (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: 'No image uploaded' });
    const localPath = path_1.default.resolve(file.path);
    const logicalName = req.body.logical_name || path_1.default.parse(file.originalname).name;
    const imageId = req.body.logical_name ? `img:${logicalName}` : `img:${logicalName}-${Date.now()}`;
    // Invalidate Cloudinary + cache
    await (0, cache_1.invalidateCachedImage)(imageId);
    await (0, cloudinary_service_1.invalidateCloudinaryImage)(`nft-images/${logicalName}`);
    const cloudinaryUrl = await (0, cloudinary_service_1.uploadToCloudinary)(localPath, imageId);
    // Build different sizes (on-the-fly variant URLs)
    const baseUploadSegment = '/upload/';
    const thumbUrl = cloudinaryUrl.replace(baseUploadSegment, `${baseUploadSegment}w_300,h_300,c_fill/`);
    const mediumUrl = cloudinaryUrl.replace(baseUploadSegment, `${baseUploadSegment}w_600,h_600,c_fill/`);
    await (0, cache_1.setCachedImage)(imageId, JSON.stringify({
        original: cloudinaryUrl,
        thumbnail: thumbUrl,
        medium: mediumUrl,
    }));
    // Clean up local file after upload
    await promises_1.default.unlink(localPath);
    res.json({
        success: true,
        message: 'Image uploaded and optimized successfully',
        data: {
            id: imageId,
            original: cloudinaryUrl,
            thumbnail: thumbUrl,
            medium: mediumUrl
        }
    });
    return;
};
exports.imageCloudinaryUploadController = imageCloudinaryUploadController;
