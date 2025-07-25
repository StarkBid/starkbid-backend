"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
class JwtService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.accessTokenSecret, {
            expiresIn: jwt_config_1.jwtConfig.accessTokenExpiration,
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.refreshTokenSecret, {
            expiresIn: jwt_config_1.jwtConfig.refreshTokenExpiration,
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.accessTokenSecret, {
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        });
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.refreshTokenSecret, {
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        });
    }
    static generateTokens(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
}
exports.JwtService = JwtService;
