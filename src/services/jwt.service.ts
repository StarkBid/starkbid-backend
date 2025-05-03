import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { Types } from 'mongoose';

export interface TokenPayload {
  userId: Types.ObjectId;
  email: string;
  role: string;
}

export class JwtService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload as jwt.JwtPayload,
      jwtConfig.accessTokenSecret as jwt.Secret,
      {
        expiresIn: jwtConfig.accessTokenExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      } as jwt.SignOptions
    );
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload as jwt.JwtPayload,
      jwtConfig.refreshTokenSecret as jwt.Secret,
      {
        expiresIn: jwtConfig.refreshTokenExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      } as jwt.SignOptions
    );
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.accessTokenSecret as jwt.Secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.refreshTokenSecret as jwt.Secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as TokenPayload;
  }

  static generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
} 