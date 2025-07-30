import { Request, Response } from 'express';
import { User } from '../models/User';
import { NFT } from '../models/NFT';
import Auction from '../models/Auction';
import Bid from '../models/Bid';
import Wallet from '../models/Wallet';

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
