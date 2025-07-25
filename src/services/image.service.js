"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeImage = optimizeImage;
exports.invalidateLocalImages = invalidateLocalImages;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const cache_1 = require("./cache");
const SIZES = [300, 600, 1200]; // thumbnail, medium, large
async function optimizeImage(filePath, outputDir, baseName) {
    const outputs = {};
    for (const size of SIZES) {
        const outputFile = path_1.default.join(outputDir, `${baseName}-${size}.webp`);
        console.log(`Optimizing image to ${outputFile}`);
        await (0, sharp_1.default)(filePath)
            .resize({ width: size })
            .webp({ quality: 80 })
            .toFile(outputFile);
        outputs[size] = outputFile;
    }
    return outputs;
}
async function invalidateLocalImages(baseFileName) {
    for (const size of SIZES) {
        const filePath = path_1.default.join(__dirname, "..", "..", "uploads", `${baseFileName}-${size}.webp`);
        try {
            await promises_1.default.unlink(filePath);
            console.log(`Deleted local image: ${filePath}`);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }
    }
    await (0, cache_1.invalidateCachedImage)(baseFileName);
    console.log(`Invalidated cache for ${baseFileName}`);
}
