import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  wallets: mongoose.Types.ObjectId[];
  firstName: string;
  lastName: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
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
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
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
  foreignField: 'creator'
});

userSchema.virtual('ownedNFTs', {
  ref: 'NFT',
  localField: '_id',
  foreignField: 'currentOwner'
});

userSchema.virtual('activeBids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'bidderId',
  match: { status: 'confirmed', isWinning: true }
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
