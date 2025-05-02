import mongoose, { Document, Schema } from 'mongoose';

export interface ICollectible extends Document {
  name: string;
  description?: string;
  imageUrl: string;
  creator: mongoose.Types.ObjectId;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const collectibleSchema = new Schema<ICollectible>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'ETH' },
  },
  { timestamps: true }
);

export const Collectible = mongoose.model<ICollectible>('Collectible', collectibleSchema);