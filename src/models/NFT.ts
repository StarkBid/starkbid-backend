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
    mintError: { type: String }
  },
  { timestamps: true }
);

// Inherit from Collectible schema
nftSchema.add(new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'ETH' }
}));

export const NFT = mongoose.model<INFT>('NFT', nftSchema); 