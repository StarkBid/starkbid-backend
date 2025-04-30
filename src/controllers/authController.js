"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.signIn = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
const jwt_config_1 = require("../config/jwt.config");
const uuid_1 = require("uuid");
const signIn = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            logger_1.logger.warn(`Failed login attempt for non-existent user: ${email}`);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger_1.logger.warn(`Failed login attempt for user: ${email}`);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate session ID
        const sessionId = (0, uuid_1.v4)();
        // Create token payload
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            sessionId,
        };
        // Generate token pair
        const { accessToken, refreshToken } = (0, jwt_config_1.generateTokenPair)(tokenPayload);
        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        // Create new session
        await Session_1.Session.create({
            userId: user._id.toString(),
            sessionId,
            refreshToken,
            userAgent,
            ipAddress,
            expiresAt,
            isActive: true,
        });
        logger_1.logger.info(`Successful login for user: ${email}`);
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
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        next(error);
    }
};
exports.signIn = signIn;
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'No refresh token provided' });
            return;
        }
        // Verify refresh token
        const payload = (0, jwt_config_1.verifyRefreshToken)(refreshToken);
        // Find active session
        const session = await Session_1.Session.findOne({
            sessionId: payload.sessionId,
            refreshToken,
            isActive: true,
        });
        if (!session || session.isExpired()) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        // Generate new token pair
        const { accessToken, refreshToken: newRefreshToken } = (0, jwt_config_1.generateTokenPair)({
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
    }
    catch (error) {
        logger_1.logger.error('Token refresh error:', error);
        next(error);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(200).json({ message: 'Logged out successfully' });
            return;
        }
        // Invalidate session
        await Session_1.Session.findOneAndUpdate({ refreshToken }, { isActive: false });
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        next(error);
    }
};
exports.logout = logout;
