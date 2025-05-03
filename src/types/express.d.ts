import { Types } from 'mongoose';

declare module 'express' {
  interface Request {
    user?: {
      userId: Types.ObjectId;
      email: string;
      role: string;
    };
  }
} 