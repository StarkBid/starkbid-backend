import mongoose, { Document, Schema } from 'mongoose';

export interface IAuction extends Document {
  nftId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId; // Reference to User
  startPrice: number; // in ETH (use existing price field as reference)
  currentPrice: number; // in ETH
  reservePrice?: number; // minimum acceptable price
  currency: string; // 'ETH' or other supported currencies
  usdPrice: number; // calculated field
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  winningBidId?: mongoose.Types.ObjectId;
  bids: mongoose.Types.ObjectId[];
  totalBids: number;
  blockchain: string; // 'ethereum' | 'starknet'
  createdAt: Date;
  updatedAt: Date;
}

const auctionSchema = new Schema<IAuction>({
  nftId: { type: Schema.Types.ObjectId, ref: 'NFT', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  reservePrice: { type: Number, min: 0 },
  currency: { type: String, default: 'ETH' },
  usdPrice: { type: Number, default: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'cancelled'],
    default: 'pending'
  },
  winningBidId: { type: Schema.Types.ObjectId, ref: 'Bid' },
  bids: [{ type: Schema.Types.ObjectId, ref: 'Bid' }],
  totalBids: { type: Number, default: 0 },
  blockchain: { type: String, required: true, enum: ['ethereum', 'starknet'] }
}, { timestamps: true });
