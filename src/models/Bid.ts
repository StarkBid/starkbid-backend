import mongoose, { Document, Schema } from 'mongoose';

export interface IBid extends Document {
  auctionId: mongoose.Types.ObjectId;
  bidderId: mongoose.Types.ObjectId;
  bidderWallet: string;
  amount: number;
  currency: string;
  usdAmount: number;
  timestamp: Date;
  isWinning: boolean;
  transactionHash?: string;
  blockchain: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>({
  auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
  bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bidderWallet: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'ETH' },
  usdAmount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  isWinning: { type: Boolean, default: false },
  transactionHash: { type: String },
  blockchain: { type: String, required: true, enum: ['ethereum', 'starknet'], index: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  }
}, { timestamps: true });

export const Bid = mongoose.model<IBid>('Bid', bidSchema);
