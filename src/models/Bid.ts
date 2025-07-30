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
  blockchain: 'ethereum' | 'starknet';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>({
  auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    default: 'pending',
  },
}, { timestamps: true });

bidSchema.index({ auctionId: 1 });
bidSchema.index({ bidderId: 1 });
bidSchema.index({ blockchain: 1 });

export default mongoose.model<IBid>('Bid', bidSchema);
