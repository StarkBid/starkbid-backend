import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  collectionNumber: string;
  email: string;
  description: string;
  coverPhotoUrl: string;
  profilePhotoUrl: string;
  collectionUrl: string;
  socialLinks: {
    x: string;
    instagram: string;
    discord: string;
    telegram: string;
  };
  creatorId: mongoose.Types.ObjectId;
  blockchain: 'ethereum' | 'starknet';
  standard: 'ERC-721'; 
  isVerified: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true, max: 100 },
    collectionNumber: { type: String, required: true, unique: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    coverPhotoUrl: { type: String, required: true },
    profilePhotoUrl: { type: String, required: true },
    collectionUrl: { type: String, required: true, unique: true },
    socialLinks: {
      x: { type: String, default: '' },
      instagram: { type: String, default: '' },
      discord: { type: String, default: '' },
      telegram: { type: String, default: '' }
    },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockchain: {
      type: String,
      enum: ['ethereum', 'starknet'],
      required: true
    },
    standard: {
      type: String,
      enum: ['ERC-721'],
      default: 'ERC-721'
    },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }  
)

export const COLLECTION = mongoose.model<ICollection>('COLLECTION', collectionSchema); 