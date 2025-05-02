import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  address: string;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'linked' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    address:    { type: String, required: true, unique: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status:     { type: String, enum: ['pending','linked','rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
