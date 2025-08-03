import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
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
  comparePassword(candidatePassword: string): Promise<boolean>;
  // Virtual fields for auction functionality
  displayName: string;
  profileImage?: string;
  isVerified?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    password: {
      type: String,
      required: true,
      minlength: 8,
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
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Virtual fields for auction functionality
userSchema.virtual('displayName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
