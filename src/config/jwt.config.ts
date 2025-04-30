import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    expiresIn: '15m' as const, // 15 minutes
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: '7d' as const, // 7 days
  },
};

export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  const accessTokenOptions: SignOptions = {
    expiresIn: JWT_CONFIG.accessToken.expiresIn,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: JWT_CONFIG.refreshToken.expiresIn,
  };

  const accessToken = jwt.sign(
    payload,
    JWT_CONFIG.accessToken.secret,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { ...payload, isRefresh: true },
    JWT_CONFIG.refreshToken.secret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_CONFIG.accessToken.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_CONFIG.refreshToken.secret) as TokenPayload;
}; 