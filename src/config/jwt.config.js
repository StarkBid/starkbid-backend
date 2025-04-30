"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = exports.JWT_CONFIG = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.JWT_CONFIG = {
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
        expiresIn: '15m', // 15 minutes
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '7d', // 7 days
    },
};
const generateTokenPair = (payload) => {
    const accessTokenOptions = {
        expiresIn: exports.JWT_CONFIG.accessToken.expiresIn,
    };
    const refreshTokenOptions = {
        expiresIn: exports.JWT_CONFIG.refreshToken.expiresIn,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, exports.JWT_CONFIG.accessToken.secret, accessTokenOptions);
    const refreshToken = jsonwebtoken_1.default.sign({ ...payload, isRefresh: true }, exports.JWT_CONFIG.refreshToken.secret, refreshTokenOptions);
    return { accessToken, refreshToken };
};
exports.generateTokenPair = generateTokenPair;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, exports.JWT_CONFIG.accessToken.secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, exports.JWT_CONFIG.refreshToken.secret);
};
exports.verifyRefreshToken = verifyRefreshToken;
