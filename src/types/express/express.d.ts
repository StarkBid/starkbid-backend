import { Types } from 'mongoose';

declare namespace Express {
  export interface Request {
    user?: {
      userId: Types.ObjectId;
      email: string;
      role: string;
    };
  }
}
