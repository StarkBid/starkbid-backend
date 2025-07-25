"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class SessionService {
    constructor() {
        this.sessionCache = new node_cache_1.default({ stdTTL: 900 }); // 15 minutes
        this.refreshTokenCache = new node_cache_1.default({ stdTTL: 604800 }); // 7 days
    }
    static getInstance() {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }
    createSession(userId, sessionId, refreshToken) {
        this.sessionCache.set(sessionId, userId.toString());
        this.refreshTokenCache.set(userId.toString(), refreshToken);
    }
    getSession(sessionId) {
        return this.sessionCache.get(sessionId);
    }
    getRefreshToken(userId) {
        return this.refreshTokenCache.get(userId.toString());
    }
    invalidateSession(sessionId) {
        const userId = this.sessionCache.get(sessionId);
        if (userId) {
            this.refreshTokenCache.del(userId);
        }
        this.sessionCache.del(sessionId);
    }
    invalidateAllUserSessions(userId) {
        this.refreshTokenCache.del(userId.toString());
        // Note: This is a simple implementation. In a production environment,
        // you might want to maintain a list of all active sessions per user
        // to properly invalidate them all.
    }
}
exports.SessionService = SessionService;
