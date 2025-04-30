import express from 'express';
import { body } from 'express-validator';
import { signIn } from '../controllers/authController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.'
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

export default router; 