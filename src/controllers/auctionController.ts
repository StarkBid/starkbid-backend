import { getWalletBalance } from '../services/wallet.service';
import { ethToUsd } from '../utils/ethToUsd';
import { getCachedAuction, setCachedAuction } from '../services/cache';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Auction } from '../models/Auction';
import { NFT } from '../models/NFT';
import { Bid } from '../models/Bid';
import { User } from '../models/User';
import { body, validationResult } from 'express-validator';
import { io } from '../websocket';
import { verifyMessage } from 'ethers';
import { verifyStarknetSignature } from '../services/starknet.service';

// Get auction details by ID
export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    let auction = await getCachedAuction(auctionId);
    if (!auction) {
      auction = await Auction.findById(auctionId)
        .populate({
          path: 'nftId',
          populate: [
            { path: 'creator', select: 'firstName lastName email displayName' },
            { path: 'collectionId', select: 'name creatorId' },
            { path: 'currentOwner', select: 'firstName lastName displayName' }
          ]
        })
        .populate({ path: 'sellerId', select: 'firstName lastName displayName wallets' })
        .populate({ path: 'bids', populate: { path: 'bidderId', select: 'displayName firstName' } })
        .populate({ path: 'winningBidId', populate: { path: 'bidderId', select: 'displayName firstName' } });
      if (!auction) return res.status(404).json({ message: 'Auction not found' });
      await setCachedAuction(auctionId, auction);
    }
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Create new auction validators
export const createAuctionValidators = [
  body('nftId').isMongoId().withMessage('Valid NFT ID required'),
  body('startPrice').isFloat({ min: 0 }).withMessage('Start price must be >= 0'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  body('blockchain').isIn(['ethereum', 'starknet']).withMessage('Blockchain must be ethereum or starknet'),
];

// Create new auction
export const createAuction = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { nftId, startPrice, reservePrice, duration, blockchain, currency = 'ETH' } = req.body;
    const nft = await NFT.findById(nftId);
    if (!nft) return res.status(404).json({ success: false, message: 'NFT not found' });
    if (nft.mintStatus !== 'minted') return res.status(400).json({ success: false, message: 'NFT must be minted before auction' });
    if (nft.isOnAuction) return res.status(400).json({ success: false, message: 'NFT is already on auction' });
    // Seller must be current owner or creator
    const sellerId = nft.currentOwner || nft.creator;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    const usdPrice = await ethToUsd(startPrice);
    // Royalty calculation
    const royalty = nft.supplyRoyalties ? (startPrice * nft.supplyRoyalties) / 100 : 0;
    const auction = await Auction.create({
      nftId,
      sellerId,
      startPrice,
      currentPrice: startPrice,
      reservePrice,
      currency,
      usdPrice,
      startTime,
      endTime,
      isActive: true,
      status: 'active',
      blockchain,
      // Optionally store royalty
      royalty
    });
    nft.isOnAuction = true;
    nft.auctionHistory.push(auction._id as mongoose.Types.ObjectId);
    await nft.save();
    res.status(201).json({ success: true, auction, message: 'Auction created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};


// Place a bid on auction validators
export const placeBidValidators = [
  body('amount').isFloat({ min: 0.0001 }).withMessage('Bid amount must be positive'),
  body('walletAddress').isString().notEmpty().withMessage('Wallet address required'),
  body('blockchain').isIn(['ethereum', 'starknet']).withMessage('Blockchain must be ethereum or starknet'),
  body('signature').isString().notEmpty().withMessage('Wallet signature required'),
];

// Placeholder for wallet signature verification
// Real wallet signature verification
function verifyWalletSignature(walletAddress: string, signature: string, amount: number, blockchain: string = 'ethereum'): boolean {
  try {
    if (blockchain === 'ethereum') {
      // The message to sign should be standardized (e.g., "Bid: <amount>")
      const message = `Bid:${amount}`;
      const recovered = verifyMessage(message, signature);
      return recovered.toLowerCase() === walletAddress.toLowerCase();
    } else if (blockchain === 'starknet') {
      // Integrate Starknet signature verification
      return verifyStarknetSignature(walletAddress, signature, amount);
    }
    return false;
  } catch (err) {
    return false;
  }
}

export const placeBid = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { amount, walletAddress, blockchain, signature } = req.body;
    // Verify wallet signature
    if (!verifyWalletSignature(walletAddress, signature, amount)) {
      return res.status(400).json({ success: false, message: 'Invalid wallet signature.' });
    }
    const auction = await Auction.findById(req.params.auctionId).populate('bids');
    if (!auction || !auction.isActive || auction.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Auction not active' });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ success: false, message: 'Bid must be higher than current price' });
    }
    // Find user by wallet
    const user = await User.findOne({ wallets: walletAddress });
    if (!user) return res.status(404).json({ success: false, message: 'User not found for wallet' });
    // Validate wallet balance
    const balance = await getWalletBalance(walletAddress, blockchain);
    if (balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for bid.' });
    }
    // Convert ETH to USD
    const usdAmount = await ethToUsd(amount);
    // Royalty calculation
    const nft = await NFT.findById(auction.nftId);
    const royalty = nft && nft.supplyRoyalties ? (amount * nft.supplyRoyalties) / 100 : 0;

    // On-chain transaction integration
    let transactionHash = '';
    let bidStatus: 'pending' | 'confirmed' | 'failed' = 'pending';
    try {
      // These should be loaded from config/env or auction/NFT data
      const providerUrl = process.env.ETH_PROVIDER_URL || '';
      const privateKey = process.env.BIDDER_PRIVATE_KEY || '';
      // For demo, use auction.nftId to get contract info (should be replaced with real logic)
      const contractAddress = nft?.contractAddress || '';
      // TODO: Replace with your actual contract ABI
      interface ContractAbiItem {
        type: string;
        name?: string;
        inputs?: Array<{ name: string; type: string }>;
        outputs?: Array<{ name: string; type: string }>;
        stateMutability?: string;
      }
      const contractAbi: ContractAbiItem[] = [/* ...ABI here... */];
      const method = 'placeBid';
      const args = [auction._id, walletAddress, amount];

      if (blockchain === 'ethereum') {
        const { sendBidTransaction } = await import('../services/ethereum.service');
        const tx = await sendBidTransaction(providerUrl, privateKey, contractAddress, contractAbi, method, args);
        transactionHash = tx?.hash || '';
        bidStatus = transactionHash ? 'confirmed' : 'failed';
      } else if (blockchain === 'starknet') {
        const { sendStarknetBidTransaction } = await import('../services/starknet.service');
        transactionHash = await sendStarknetBidTransaction(providerUrl, privateKey, contractAddress, contractAbi, method, args);
        bidStatus = transactionHash ? 'confirmed' : 'failed';
      }
    } catch (txErr) {
      bidStatus = 'failed';
    }

    // Create bid
    const bid = await Bid.create({
      auctionId: auction._id,
      bidderId: user._id,
      bidderWallet: walletAddress,
      amount,
      currency: auction.currency,
      usdAmount,
      blockchain,
      status: bidStatus,
      isWinning: bidStatus === 'confirmed',
      transactionHash,
      royalty
    });
    // Mark previous winning bid as not winning
    let previousBidder = null;
    if (auction.bids.length > 0) {
      const prevBidId = auction.bids[auction.bids.length - 1];
      const prevBid = await Bid.findByIdAndUpdate(prevBidId, { isWinning: false });
      if (prevBid) {
        previousBidder = prevBid.bidderId;
      }
    }
    auction.bids.push(bid._id as mongoose.Types.ObjectId);
    auction.currentPrice = amount;
    auction.totalBids = auction.bids.length;
    auction.winningBidId = bid._id as mongoose.Types.ObjectId;
    await auction.save();
    // Emit WebSocket event for bid placement
    io.to(`auction_${auction._id}`).emit('BID_PLACED', {
      auctionId: auction._id,
      data: {
        newBid: bid,
        currentPrice: auction.currentPrice,
        timeRemaining: (auction.endTime.getTime() - Date.now()) / 1000
      },
      previousBidder
    });
    res.status(201).json({ success: true, bid, auction, message: bidStatus === 'confirmed' ? 'Bid placed successfully' : 'Bid transaction failed', transactionHash });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

// Get bid history for auction
export const getBidHistory = async (req: Request, res: Response) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate({
      path: 'bids',
      populate: { path: 'bidderId', select: 'displayName firstName' }
    });
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    res.json({ success: true, bids: auction.bids });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

// Get active auctions (marketplace listing)
export const getActiveAuctions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, blockchain } = req.query;
    const query: any = { isActive: true, status: 'active' };
    if (blockchain) query.blockchain = blockchain;
    const auctions = await Auction.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate({
        path: 'nftId',
        select: 'name imageUrl price currency creator',
        populate: { path: 'creator', select: 'displayName' }
      });
    res.json({ success: true, auctions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

// End auction
export const endAuction = async (req: Request, res: Response) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('nftId winningBidId');
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    if (!auction.isActive || auction.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Auction is not active' });
    }
    auction.isActive = false;
    auction.status = 'ended';
    await auction.save();
    // Transfer ownership if there is a winning bid
    if (auction.winningBidId && auction.nftId) {
      const nft = await NFT.findById(auction.nftId._id);
      if (nft && auction.winningBidId) {
        // Populate winningBidId to get bidderId
        const winningBid = await Bid.findById(auction.winningBidId);
        if (winningBid) {
          nft.currentOwner = winningBid.bidderId;
        }
        nft.isOnAuction = false;
        await nft.save();
      }
    }
    // Emit WebSocket event for auction end
    io.to(`auction_${auction._id}`).emit('AUCTION_ENDED', {
      auctionId: auction._id,
      data: {
        currentPrice: auction.currentPrice,
        timeRemaining: 0
      }
    });
    res.json({ success: true, auction, message: 'Auction ended successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
