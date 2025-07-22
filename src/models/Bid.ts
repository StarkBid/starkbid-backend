import mongoose, { Document, Schema } from 'mongoose';

export interface IBid extends Document {
  nft: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  bidderWallet: string; // Wallet address used for bid
  amount: number; // in ETH or specified currency
  currency: string;
  usdAmount: number; // calculated at time of bid
  timestamp: Date;
  isWinning: boolean;
  transactionHash?: string;
  blockchain: string; // 'ethereum' | 'starknet'
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  durationType: 'immediate' | 'hours' | 'days';
  durationValue?: number; // Optional for immediate bids
  expiresAt?: Date; // Optional, computed based on durationType and durationValue
}

const bidSchema = new Schema<IBid>({
  nft: { type: Schema.Types.ObjectId, ref: 'NFT', required: true },
  bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bidderWallet: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'ETH' },
  usdAmount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  isWinning: { type: Boolean, default: false },
  transactionHash: { type: String },
  blockchain: { type: String, required: true, enum: ['ethereum', 'starknet'] },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  durationType: { type: String, enum: ['immediate', 'hours', 'days'], required: true },
  durationValue: { type: Number }, // Number of hours or days
  expiresAt: { type: Date } // Computed based on durationType and durationValue
}, { timestamps: true });

export const Bid = mongoose.model<IBid>('Bid', bidSchema);
