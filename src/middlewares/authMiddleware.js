"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_config_1 = require("../config/jwt.config");
const Session_1 = require("../models/Session");
const logger_1 = require("../utils/logger");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_config_1.verifyAccessToken)(token);
        // Verify session is still active
        const session = await Session_1.Session.findOne({
            sessionId: payload.sessionId,
            isActive: true,
        });
        if (!session || session.isExpired()) {
            res.status(401).json({ message: 'Session expired or invalid' });
            return;
        }
        // Update last activity
        session.updateLastActivity();
        // Attach user info to request
        req.user = {
            id: payload.userId,
            email: payload.email,
            sessionId: payload.sessionId,
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        next(error);
    }
};
exports.authenticate = authenticate;
