import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { Session } from '../models/Session';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify session is still active
    const session = await Session.findOne({
      sessionId: payload.sessionId,
      isActive: true,
    });

    if (!session || session.isExpired()) {
      res.status(401).json({ message: 'Session expired or invalid' });
      return;
    }

    // Update last activity
    session.updateLastActivity();

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
}; 