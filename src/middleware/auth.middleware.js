"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.authenticateToken = void 0;
const jwt_service_1 = require("../services/jwt.service");
const session_service_1 = require("../services/session.service");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access token is required' });
        return;
    }
    try {
        const payload = jwt_service_1.JwtService.verifyAccessToken(token);
        const sessionService = session_service_1.SessionService.getInstance();
        const session = sessionService.getSession(token);
        if (!session) {
            res.status(401).json({ message: 'Session expired or invalid' });
            return;
        }
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }
    try {
        const payload = jwt_service_1.JwtService.verifyRefreshToken(refreshToken);
        const sessionService = session_service_1.SessionService.getInstance();
        const storedRefreshToken = sessionService.getRefreshToken(payload.userId);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const { accessToken, refreshToken: newRefreshToken } = jwt_service_1.JwtService.generateTokens(payload);
        sessionService.createSession(payload.userId, accessToken, newRefreshToken);
        return res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }
};
exports.refreshToken = refreshToken;
const logout = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        const sessionService = session_service_1.SessionService.getInstance();
        sessionService.invalidateSession(token);
    }
    return res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
