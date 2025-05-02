"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000;
const signIn = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            logger_1.logger.warn(`Failed login attempt for non-existent user: ${email}`);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            logger_1.logger.warn(`Locked account attempted login: ${email}`);
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
                logger_1.logger.warn(`Account locked for user: ${email}`);
            }
            await user.save();
            logger_1.logger.warn(`Failed login attempt for user: ${email}`);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        logger_1.logger.info(`Successful login for user: ${email}`);
        // Return success response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
        return;
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};
exports.signIn = signIn;
