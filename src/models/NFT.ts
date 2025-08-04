import mongoose, { Document, Schema } from 'mongoose';
import { ICollectible } from './Collectible';

export interface INFT extends ICollectible {
  blockchain: string;
  userWallet: string;
  supplyRoyalties: number;
  collectionId?: mongoose.Types.ObjectId;
  mintStatus: 'pending' | 'minted' | 'failed';
  mintTransactionHash?: string;
  mintError?: string;
  // New auction-related fields
  tokenId?: string;
  contractAddress?: string;
  currentOwner?: mongoose.Types.ObjectId;
  isOnAuction: boolean;
  auctionHistory: mongoose.Types.ObjectId[];
}

const nftSchema = new Schema<INFT>(
  {
    blockchain: { type: String, required: true, enum: ['ethereum', 'starknet'] },
    userWallet: { type: String, required: true },
    supplyRoyalties: { type: Number, required: true, min: 0, max: 100 },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' },
    mintStatus: { 
      type: String, 
      enum: ['pending', 'minted', 'failed'],
      default: 'pending'
    },
    mintTransactionHash: { type: String },
    mintError: { type: String },
    // Auction fields
    tokenId: { type: String, sparse: true, unique: true },
    contractAddress: { type: String },
    currentOwner: { type: Schema.Types.ObjectId, ref: 'User' },
    isOnAuction: { type: Boolean, default: false },
    auctionHistory: [{ type: Schema.Types.ObjectId, ref: 'Auction' }],
  },
  { timestamps: true }
);

// Inherit from Collectible schema
nftSchema.add(new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'ETH' }
}));

nftSchema.index({ isOnAuction: 1 });
nftSchema.index({ currentOwner: 1 });
nftSchema.index({ tokenId: 1 });
nftSchema.index({ contractAddress: 1 });

export const NFT = mongoose.model<INFT>('NFT', nftSchema); 