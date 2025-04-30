import express from 'express';
import { body } from 'express-validator';
import { signIn, refreshToken, logout } from '../controllers/authController';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const router = express.Router();

// Middleware
router.use(cookieParser());

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 refresh attempts per hour
  message: {
    message: 'Too many refresh attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter'),
];

// Routes
router.post('/signin', loginLimiter, loginValidation, signIn);
router.post('/refresh', refreshLimiter, refreshToken);
router.post('/logout', logout);

export default router; 