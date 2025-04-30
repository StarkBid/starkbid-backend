"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router = express_1.default.Router();
// Middleware
router.use((0, cookie_parser_1.default)());
// Rate limiting configuration
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const refreshLimiter = (0, express_rate_limit_1.default)({
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
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain at least one letter'),
];
// Routes
router.post('/signin', loginLimiter, loginValidation, authController_1.signIn);
router.post('/refresh', refreshLimiter, authController_1.refreshToken);
router.post('/logout', authController_1.logout);
exports.default = router;
