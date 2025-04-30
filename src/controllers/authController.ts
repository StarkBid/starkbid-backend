import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { generateTokenPair, TokenPayload, verifyRefreshToken } from '../config/jwt.config';
import { v4 as uuidv4 } from 'uuid';

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate session ID
    const sessionId = uuidv4();

    // Create token payload
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      sessionId,
    };

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create new session
    await Session.create({
      userId: user._id.toString(),
      sessionId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
      isActive: true,
    });

    logger.info(`Successful login for user: ${email}`);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Find active session
    const session = await Session.findOne({
      sessionId: payload.sessionId,
      refreshToken,
      isActive: true,
    });

    if (!session || session.isExpired()) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      sessionId: payload.sessionId,
    });

    // Update session with new refresh token
    session.refreshToken = newRefreshToken;
    session.updateLastActivity();
    await session.save();

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      accessToken,
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(200).json({ message: 'Logged out successfully' });
      return;
    }

    // Invalidate session
    await Session.findOneAndUpdate(
      { refreshToken },
      { isActive: false }
    );

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}; 