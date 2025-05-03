import { JwtService } from '../services/jwt.service';
import { SessionService } from '../services/session.service';
import { Types } from 'mongoose';

describe('JWT Authentication System', () => {
  const mockUser = {
    userId: new Types.ObjectId(),
    email: 'test@example.com',
    role: 'user'
  };

  describe('JwtService', () => {
    it('should generate valid access and refresh tokens', () => {
      const { accessToken, refreshToken } = JwtService.generateTokens(mockUser);
      
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should verify valid access token', () => {
      const { accessToken } = JwtService.generateTokens(mockUser);
      const payload = JwtService.verifyAccessToken(accessToken);
      
      expect(payload.userId.toString()).toBe(mockUser.userId.toString());
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should verify valid refresh token', () => {
      const { refreshToken } = JwtService.generateTokens(mockUser);
      const payload = JwtService.verifyRefreshToken(refreshToken);
      
      expect(payload.userId.toString()).toBe(mockUser.userId.toString());
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => JwtService.verifyAccessToken(invalidToken)).toThrow();
    });
  });

  describe('SessionService', () => {
    const sessionService = SessionService.getInstance();

    it('should create and retrieve session', () => {
      const { accessToken, refreshToken } = JwtService.generateTokens(mockUser);
      sessionService.createSession(mockUser.userId, accessToken, refreshToken);
      
      const session = sessionService.getSession(accessToken);
      expect(session).toBe(mockUser.userId.toString());
    });

    it('should retrieve refresh token', () => {
      const { accessToken, refreshToken } = JwtService.generateTokens(mockUser);
      sessionService.createSession(mockUser.userId, accessToken, refreshToken);
      
      const storedRefreshToken = sessionService.getRefreshToken(mockUser.userId);
      expect(storedRefreshToken).toBe(refreshToken);
    });

    it('should invalidate session', () => {
      const { accessToken, refreshToken } = JwtService.generateTokens(mockUser);
      sessionService.createSession(mockUser.userId, accessToken, refreshToken);
      
      sessionService.invalidateSession(accessToken);
      const session = sessionService.getSession(accessToken);
      expect(session).toBeUndefined();
    });

    it('should invalidate all user sessions', () => {
      const { accessToken, refreshToken } = JwtService.generateTokens(mockUser);
      sessionService.createSession(mockUser.userId, accessToken, refreshToken);
      
      sessionService.invalidateAllUserSessions(mockUser.userId);
      const storedRefreshToken = sessionService.getRefreshToken(mockUser.userId);
      expect(storedRefreshToken).toBeUndefined();
    });
  });
}); 