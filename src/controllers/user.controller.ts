import { Request, Response } from 'express';
import { User } from '../models/User';
import { NFT } from '../models/NFT';
import Auction from '../models/Auction';
import Bid from '../models/Bid';
import Wallet from '../models/Wallet';
import { sanitizeSocials, sanitizeText } from "../utils/sanitize";
import { isValidImageType } from "../validations/media.validation";
import { invalidateCloudinaryImage, uploadImageToCloudinary } from "../services/cloudinary.service";
import { User } from "../models/User";
import { profileUpdateSchema } from "../validations/profile.validation";

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get user's created NFTs
export const getCreatedNFTs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const nfts = await NFT.find({ creator: userId });
    res.json(nfts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get user's owned NFTs
export const getOwnedNFTs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const nfts = await NFT.find({ currentOwner: userId });
    res.json(nfts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get user's active bids
export const getActiveBids = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bids = await Bid.find({ bidderId: userId, status: 'confirmed', isWinning: true });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get user's auction history
export const getAuctionHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const auctions = await Auction.find({ sellerId: userId });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get user's wallets
export const getUserWallets = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('wallets');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.wallets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const parsed = profileUpdateSchema.safeParse({
        username: req.body.username,
        bio: req.body.bio,
        website: req.body.website,
        socials: req.body.socials ? JSON.parse(req.body.socials) : {},
      });
      if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: 'Invalid input',
            errors: parsed.error.flatten(),
        });
        return;
      }
      const parsedData = parsed.data;
      const sanitizedData: {
        username: string;
        bio: string;
        website: string;
        socials: { x: string; insta: string; discord: string; telegram: string; };
        profilePhoto?: any;
        coverPhoto?: any;
      } = {
        username: sanitizeText(parsedData.username),
        bio: sanitizeText(parsedData.bio || ''),
        website: sanitizeText(parsedData.website || ''),
        socials: sanitizeSocials(parsedData.socials || {}),
      };

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Unable to retrieve user!' });
        return;
      }

      if (req.files?.profile) {
        const profileImg = req.files.profile[0];
        if (!isValidImageType(profileImg.mimetype)) throw new Error('Invalid profile image type');
        if (user.profilePhoto?.publicId) {
          await invalidateCloudinaryImage(user.profilePhoto.publicId);
        }

        const uploaded = await uploadImageToCloudinary(profileImg.path, 'profile_photos');
        sanitizedData.profilePhoto = uploaded;
      }

      if (req.files?.cover) {
        const coverImg = req.files.cover[0];
        if (!isValidImageType(coverImg.mimetype)) throw new Error('Invalid cover image type');

        if (user.coverPhoto?.publicId) {
          await invalidateCloudinaryImage(user.coverPhoto.publicId);
        }

        const uploaded = await uploadImageToCloudinary(coverImg.path, 'cover_photos');
        sanitizedData.coverPhoto = uploaded;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, sanitizedData, { new: true });
      res.status(200).json({ success: true, user: updatedUser });
      return;
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ success: false, message: err.message || 'Failed to update profile' });
      return;
    }
}
