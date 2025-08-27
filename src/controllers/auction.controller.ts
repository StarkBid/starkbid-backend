import { Request, Response } from 'express';
import Auction from '../models/Auction';
import mongoose from 'mongoose';
import { convertEthToUsd } from '../services/price.service';
import { validateWalletOwnership, validateUserBalance, rateLimitBid } from '../services/bidValidation.service';
import { notifyOutbid } from '../services/notification.service';
import { emitBidUpdate } from '../services/websocket.service';
import { NFT } from '../models/NFT';
import Bid from '../models/Bid';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Get current auction for an NFT
export const getAuctionByNFT = async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const auction = await Auction.findOne({ nftId, isActive: true })
      .populate('nftId')
      .populate('sellerId')
      .populate({ path: 'bids', populate: { path: 'bidderId' } });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};

// Get auction details by ID
export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId)
      .populate('nftId')
      .populate('sellerId')
      .populate({ path: 'bids', populate: { path: 'bidderId' } });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }

};

// Create new auction
export const createAuction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nftId, startPrice, reservePrice, duration, blockchain, currency } = req.body;
    const nft = await NFT.findById(nftId);
    if (!nft) return res.status(404).json({ message: 'NFT not found' });
    // Only creator or current owner can create auction
    // Use userId from req.user or req.body.sellerId
    const userId = req.user?.userId || req.body.sellerId;
    if (!userId || (userId.toString() !== nft.creator.toString() && userId.toString() !== nft.currentOwner?.toString())) {
      return res.status(403).json({ message: 'Not authorized to create auction for this NFT' });
    }
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    const usdPrice = await convertEthToUsd(startPrice);
    const auction = await Auction.create({
      nftId,
      sellerId: userId,
      startPrice,
      currentPrice: startPrice,
      reservePrice,
      currency: currency || 'ETH',
      usdPrice,
      startTime,
      endTime,
      isActive: true,
      status: 'active',
      blockchain,
      bids: [],
      totalBids: 0,
    });
  nft.isOnAuction = true;
  nft.auctionHistory = nft.auctionHistory || [];
  nft.auctionHistory.push(auction._id as mongoose.Types.ObjectId);
  await nft.save();
    res.json({ success: true, auction, message: 'Auction created successfully' });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};

// Place a bid on auction
export const placeBid = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { auctionId } = req.params;
    const { amount, walletAddress, signature, blockchain } = req.body;
    const auction = await Auction.findById(auctionId).populate({ path: 'bids', populate: { path: 'bidderId' } });
    if (!auction || !auction.isActive) return res.status(404).json({ message: 'Auction not found or not active' });
    if (amount <= auction.currentPrice) return res.status(400).json({ message: 'Bid must be higher than current price' });
    const userId = req.user?.userId || req.body.bidderId;
    // Bid validation
    if (!rateLimitBid(userId)) return res.status(429).json({ message: 'Rate limit exceeded' });
    if (!await validateWalletOwnership(userId, walletAddress)) return res.status(403).json({ message: 'Wallet not owned by user' });
    if (!await validateUserBalance(walletAddress, amount)) return res.status(400).json({ message: 'Insufficient wallet balance' });
    // Notify previous highest bidder
    let previousBidder = null;
    if (auction.bids.length > 0) {
      const lastBid: any = auction.bids[auction.bids.length - 1];
      previousBidder = lastBid.bidderId && lastBid.bidderId._id ? lastBid.bidderId._id.toString() : null;
      if (previousBidder) await notifyOutbid(previousBidder, auctionId, amount);
    }
    const usdAmount = await convertEthToUsd(amount);
    const bid = await Bid.create({
      auctionId,
      bidderId: userId,
      bidderWallet: walletAddress,
      amount,
      currency: auction.currency,
      usdAmount,
      isWinning: true,
      blockchain,
      status: 'confirmed',
    });
    auction.currentPrice = amount;
    auction.bids.push(bid._id as mongoose.Types.ObjectId);
    auction.totalBids += 1;
    await auction.save();
    // Emit WebSocket event for real-time update
    emitBidUpdate(auctionId, {
      newBid: bid,
      currentPrice: auction.currentPrice,
      timeRemaining: (auction.endTime.getTime() - Date.now()) / 1000
    });
    res.json({ success: true, bid, auction, message: 'Bid placed successfully', previousBidder });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};

// Get bid history for auction
export const getBidHistory = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.find({ auctionId }).populate('bidderId');
    res.json(bids);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};

// End auction (automatic or manual)
export const endAuction = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction || !auction.isActive) return res.status(404).json({ message: 'Auction not found or not active' });
    auction.isActive = false;
    auction.status = 'ended';
    // TODO: Transfer ownership, handle royalties, notify winner
    await auction.save();
    res.json({ success: true, auction, message: 'Auction ended successfully' });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};

// Get active auctions (marketplace listing)
export const getActiveAuctions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, blockchain } = req.query;
    const query: any = { isActive: true };
    if (blockchain) query.blockchain = blockchain;
    const auctions = await Auction.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate('nftId')
      .populate('sellerId');
    res.json(auctions);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
    return;
  }
};
