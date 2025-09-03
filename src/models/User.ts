import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  wallets: mongoose.Types.ObjectId[];
  username: string;
  profilePhoto: {
    url: string,
    publicId: string,
  },
  coverPhoto: {
    url: string,
    publicId: string,
  }
  bio?: string;
  socials?: {
    x?: string;
    insta?: string;
    discord?: string;
    telegram?: string;
  };
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isVerified?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    profilePhoto: {
      url: String,
      publicId: {
        type: String,
        default: '',
      },
    },
    coverPhoto: {
      url: String,
      publicId: {
        type: String,
        default: '',
      },
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    socials: {
      x: { type: String, default: '' },
      insta: { type: String, default: '' },
      discord: { type: String, default: '' },
      telegram: { type: String, default: '' },
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'Wallet' }],
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual('createdNFTs', {
  ref: 'NFT',
  localField: '_id',
  foreignField: 'creator',
});

userSchema.virtual('ownedNFTs', {
  ref: 'NFT',
  localField: '_id',
  foreignField: 'currentOwner',
});

userSchema.virtual('activeBids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'bidderId',
  options: { match: { status: 'confirmed', isWinning: true } },
});


export const User = mongoose.model<IUser>('User', userSchema);
