import express from 'express';
import { body } from 'express-validator';
import { signIn } from '../controllers/authController';
import { loginLimiter } from '../middlewares/rateLimiter';

const router = express.Router();


// Validation middleware
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

// Routes
router.post('/signin', loginLimiter, loginValidation, signIn);

export default router;
