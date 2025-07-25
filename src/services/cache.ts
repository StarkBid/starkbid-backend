
// Simple in-memory cache for development
const memoryCache: Record<string, any> = {};


export async function getCachedImage(key: string) {
  return memoryCache[key] || null;
}


export async function setCachedImage(key: string, value: string, ttl = 60 * 60 * 24) {
  memoryCache[key] = value;
}


export async function invalidateCachedImage(baseFileName: string) {
  const sizes = [300, 600, 1200];
  for (const size of sizes) {
    delete memoryCache[`${baseFileName}-${size}`];
  }
}


// Auction cache helpers
export async function getCachedAuction(auctionId: string) {
  const cached = memoryCache[`auction:${auctionId}`];
  return cached ? JSON.parse(cached) : null;
}


export async function setCachedAuction(auctionId: string, data: any) {
  memoryCache[`auction:${auctionId}`] = JSON.stringify(data);
}
