import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

const rateLimitMap = new Map<string, number>();
const WINDOW_SIZE = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 5;

export function rateLimit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId: string = req.user?.userId ? String(req.user.userId) : (req.ip || 'unknown');
  const now = Date.now();
  const requests = rateLimitMap.get(userId) || 0;
  if (requests >= MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  rateLimitMap.set(userId, requests + 1);
  setTimeout(() => {
    rateLimitMap.set(userId, Math.max(0, (rateLimitMap.get(userId) || 0) - 1));
  }, WINDOW_SIZE);
  next();
}
