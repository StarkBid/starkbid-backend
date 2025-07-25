"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const ttl = Number(process.env.CACHE_TTL) || 60; // Time-to-live in seconds
const cache = new node_cache_1.default({ stdTTL: ttl, checkperiod: ttl * 0.2 });
/**
 * Cache utility for storing and retrieving data.
 */
class Cache {
    /**
     * Get data from the cache.
     * @param key - The cache key.
     * @returns The cached data or null if not found.
     */
    static get(key) {
        const data = cache.get(key);
        return data || null;
    }
    /**
     * Set data in the cache.
     * @param key - The cache key.
     * @param value - The data to cache.
     */
    static set(key, value) {
        cache.set(key, value);
    }
    /**
     * Delete data from the cache.
     * @param key - The cache key.
     */
    static delete(key) {
        cache.del(key);
    }
    /**
     * Clear all data from the cache.
     */
    static clear() {
        cache.flushAll();
    }
}
exports.Cache = Cache;
exports.default = Cache;
