import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.user = {
      userId: new ObjectId(payload.userId),
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    logger.warn('Invalid token', err);
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
