"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedImage = getCachedImage;
exports.setCachedImage = setCachedImage;
exports.invalidateCachedImage = invalidateCachedImage;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default();
async function getCachedImage(key) {
    return await redis.get(key);
}
async function setCachedImage(key, value, ttl = 60 * 60 * 24) {
    await redis.set(key, value, "EX", ttl); // Cache for 1 day
}
async function invalidateCachedImage(baseFileName) {
    const sizes = [300, 600, 1200];
    for (const size of sizes) {
        await redis.del(`${baseFileName}-${size}`);
    }
}
