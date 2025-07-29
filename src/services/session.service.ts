import NodeCache from 'node-cache';
import { Types } from 'mongoose';
import { TokenPayload } from './jwt.service';

export class SessionService {
  private static instance: SessionService;
  private sessionCache: NodeCache;
  private refreshTokenCache: NodeCache;

  private constructor() {
    this.sessionCache = new NodeCache({ stdTTL: 900 }); // 15 minutes
    this.refreshTokenCache = new NodeCache({ stdTTL: 604800 }); // 7 days
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  createSession(userId: Types.ObjectId, sessionId: string, refreshToken: string): void {
    this.sessionCache.set(sessionId, userId.toString());
    this.refreshTokenCache.set(userId.toString(), refreshToken);
  }

  getSession(sessionId: string): string | undefined {
    return this.sessionCache.get<string>(sessionId);
  }

  getRefreshToken(userId: Types.ObjectId): string | undefined {
    return this.refreshTokenCache.get<string>(userId.toString());
  }

  invalidateSession(sessionId: string): void {
    const userId = this.sessionCache.get<string>(sessionId);
    if (userId) {
      this.refreshTokenCache.del(userId);
    }
    this.sessionCache.del(sessionId);
  }

  invalidateAllUserSessions(userId: Types.ObjectId): void {
    this.refreshTokenCache.del(userId.toString());
    // Note: This is a simple implementation. In a production environment,
    // you might want to maintain a list of all active sessions per user
    // to properly invalidate them all.
  }

  clear(): void {
    this.sessionCache.close();
    this.refreshTokenCache.close();
  }
} 