import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-access-token-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  accessTokenExpiration: '15m', // 15 minutes
  refreshTokenExpiration: '7d', // 7 days
  issuer: 'starkbid',
  audience: 'starkbid-users',
}; 