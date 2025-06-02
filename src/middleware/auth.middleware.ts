import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { SessionService } from '../services/session.service';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token is required' });
    return;
  }

  try {
    const payload = JwtService.verifyAccessToken(token);
    const sessionService = SessionService.getInstance();
    const session = sessionService.getSession(token);

    if (!session) {
      res.status(401).json({ message: 'Session expired or invalid' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const payload = JwtService.verifyRefreshToken(refreshToken);
    const sessionService = SessionService.getInstance();
    const storedRefreshToken = sessionService.getRefreshToken(payload.userId);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = JwtService.generateTokens(payload);
    sessionService.createSession(payload.userId, accessToken, newRefreshToken);

    return res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const sessionService = SessionService.getInstance();
    sessionService.invalidateSession(token);
  }

  return res.status(200).json({ message: 'Logged out successfully' });
}; 