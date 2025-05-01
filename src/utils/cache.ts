import NodeCache from 'node-cache';

const ttl = Number(process.env.CACHE_TTL) || 60; // Time-to-live in seconds
const cache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2 });

/**
 * Cache utility for storing and retrieving data.
 */
export class Cache {
    /**
     * Get data from the cache.
     * @param key - The cache key.
     * @returns The cached data or null if not found.
     */
    static get<T>(key: string): T | null {
        const data = cache.get<T>(key);
        return data || null;
    }

    /**
     * Set data in the cache.
     * @param key - The cache key.
     * @param value - The data to cache.
     */
    static set<T>(key: string, value: T): void {
        cache.set(key, value);
    }

    /**
     * Delete data from the cache.
     * @param key - The cache key.
     */
    static delete(key: string): void {
        cache.del(key);
    }

    /**
     * Clear all data from the cache.
     */
    static clear(): void {
        cache.flushAll();
    }
}

export default Cache;