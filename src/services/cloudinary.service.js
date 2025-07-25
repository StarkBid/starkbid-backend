"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCloudinaryImage = exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadToCloudinary = async (filePath, publicId) => {
    const result = await cloudinary_1.default.uploader.upload(filePath, {
        public_id: publicId,
        folder: "nft-images",
        transformation: [
            { width: 600, crop: 'scale', fetch_format: 'auto', quality: 'auto' },
        ],
        overwrite: true,
        invalidate: true,
    });
    return result.secure_url;
};
exports.uploadToCloudinary = uploadToCloudinary;
const invalidateCloudinaryImage = async (publicId) => {
    try {
        await cloudinary_1.default.uploader.destroy(publicId, { invalidate: true });
        console.log(`Cloudinary image invalidated: ${publicId}`);
    }
    catch (error) {
        console.error('Error deleting cloudinary image:', error);
    }
};
exports.invalidateCloudinaryImage = invalidateCloudinaryImage;
