import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User'
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000;

export const signIn = async (req: Request, res: Response) : Promise<void> => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return
    }

    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Failed login attempt for non-existent user: ${email}`);
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      logger.warn(`Locked account attempted login: ${email}`);
       res.status(423).json({
        message: 'Account is locked. Please try again later.',
        lockUntil: user.lockUntil
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account if max attempts reached
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        logger.warn(`Account locked for user: ${email}`);
      }

      await user.save();
      logger.warn(`Failed login attempt for user: ${email}`);
       res.status(401).json({ message: 'Invalid credentials' });
       return;
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Successful login for user: ${email}`);

    // Return success response
     res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePhoto: user.profilePhoto?.url,
      }
    });

    return;

  } catch (error) {
    logger.error('Login error:', error);
     res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
