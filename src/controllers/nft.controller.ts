import { Request, Response } from 'express';
import Auction from '../models/Auction';
import { NFT } from '../models/NFT';

// Get NFT details for auction
export const getNFTDetails = async (req: Request, res: Response) => {
  try {
    const nftId = (req.params as any).nftId;
    const nft = await NFT.findById(nftId)
      .populate('creator')
      .populate('currentOwner')
      .populate('collectionId');
    if (!nft) { res.status(404).json({ message: 'NFT not found' }); return; }
    // Get current auction
    const auction = await Auction.findOne({ nftId, isActive: true });
    // Get bid history
    let bidHistory: any[] = [];
    if (auction) {
      const populatedAuction = await auction.populate({ path: 'bids', populate: { path: 'bidderId' } });
      bidHistory = populatedAuction.bids as any[];
    }
    // Get related NFTs
    let relatedNFTs: any[] = [];
    if (nft.collectionId) {
      relatedNFTs = await NFT.find({ collectionId: nft.collectionId, _id: { $ne: nft._id } }).limit(4).populate('creator');
    }
    return res.json({ nft, auction, bidHistory, relatedNFTs });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error', error: err?.message || err });
  }
};

// Get similar NFTs from same creator or collection
export const getSimilarNFTs = async (req: Request, res: Response) => {
  try {
    const nftId = (req.params as any).nftId;
    const limit = req.query && req.query.limit ? Number(req.query.limit) : 4;
    const nft = await NFT.findById(nftId);
    if (!nft) { res.status(404).json({ message: 'NFT not found' }); return; }
    let similarNFTs: any[] = [];
    if (nft.collectionId) {
      similarNFTs = await NFT.find({ collectionId: nft.collectionId, _id: { $ne: nft._id } }).limit(limit).populate('creator');
    } else {
      similarNFTs = await NFT.find({ creator: nft.creator, _id: { $ne: nft._id } }).limit(limit).populate('creator');
    }
    return res.json(similarNFTs);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error', error: err?.message || err });
  }
};
// Removed duplicate import
import { nftSubmissionSchema, NFTSubmissionPayload } from '../validations/nft.validation';
import { createNFT } from '../services/nft.service';
import { logger } from '../utils/logger';

export const submitNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request payload
    const validationResult = nftSubmissionSchema.safeParse(req.body) as { success: boolean, data: NFTSubmissionPayload, error: any };
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request payload',
        errors: validationResult.error.errors
      });
      return;
    }

    const payload: NFTSubmissionPayload = validationResult.data;
    const { blockchain, user_wallet, nft, simulate } = payload;

    // Create NFT
    const createdNFT = await createNFT({
      blockchain,
      userWallet: user_wallet,
      name: nft.name,
      creator: nft.creator,
      supplyRoyalties: nft.supply_royalties,
      description: nft.description,
      mediaUrl: nft.media_url,
      collectionId: nft.collection_id || undefined
    }, simulate);

    res.status(201).json({
      success: true,
      nftId: createdNFT._id,
      message: simulate 
        ? 'NFT created successfully (simulation mode)'
        : 'NFT created successfully and minting process initiated'
    });
  } catch (error) {
    logger.error('Error submitting NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating NFT',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 