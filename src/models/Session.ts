import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { TokenPayload } from '../config/jwt.config';

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: string;
  sessionId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  isActive: boolean;
  lastActivity: Date;
  isExpired(): boolean;
  updateLastActivity(): Promise<void>;
}

interface ISessionModel extends Model<ISession> {
  isExpired(): boolean;
  updateLastActivity(): Promise<void>;
}

const sessionSchema = new Schema<ISession, ISessionModel>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ refreshToken: 1 });

// Method to check if session is expired
sessionSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

// Method to update last activity
sessionSchema.methods.updateLastActivity = async function(): Promise<void> {
  this.lastActivity = new Date();
  await this.save();
};

export const Session = mongoose.model<ISession, ISessionModel>('Session', sessionSchema); 