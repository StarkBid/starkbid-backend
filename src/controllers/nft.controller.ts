import { Request, Response } from 'express';
import { nftSubmissionSchema, NFTSubmissionPayload } from '../validations/nft.validation';
import { createNFT } from '../services/nft.service';
import { logger } from '../utils/logger';
import Auction from '../models/Auction';
import { NFT } from '../models/NFT';

// GET /nft/:nftId/details
export const getNFTDetails = async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;

    const nft = await NFT.findById(nftId)
      .populate('creator')
      .populate('currentOwner')
      .populate('collectionId');

    if (!nft) {
      res.status(404).json({ message: 'NFT not found' });
      return;
    }

    // Get active auction and bid history
    const auction = await Auction.findOne({ nftId, isActive: true });
    let bidHistory: any[] = [];

    if (auction) {
      const populatedAuction = await auction.populate({
        path: 'bids',
        populate: { path: 'bidderId' },
      });
      bidHistory = populatedAuction.bids;
    }

    // Get related NFTs from same collection
    const relatedNFTs = nft.collectionId
      ? await NFT.find({
          collectionId: nft.collectionId,
          _id: { $ne: nft._id },
        })
          .limit(4)
          .populate('creator')
      : [];

    res.json({ nft, auction, bidHistory, relatedNFTs });
    return;
  } catch (err: any) {
    res.status(500).json({
      message: 'Server error',
      error: err?.message || err,
    });
    return;
  }
};

// GET /nft/:nftId/similar
export const getSimilarNFTs = async (req: Request, res: Response) => {
  try {
    const { nftId } = req.params;
    const limit = Number(req.query.limit) || 4;

    const nft = await NFT.findById(nftId);
    if (!nft) {
      res.status(404).json({ message: 'NFT not found' });
      return;
    }

    const query = nft.collectionId
      ? { collectionId: nft.collectionId, _id: { $ne: nft._id } }
      : { creator: nft.creator, _id: { $ne: nft._id } };

    const similarNFTs = await NFT.find(query).limit(limit).populate('creator');

    res.json(similarNFTs);
    return;
  } catch (err: any) {
    res.status(500).json({
      message: 'Server error',
      error: err?.message || err,
    });
    return;
  }
};

// POST /nft/submit
export const submitNFT = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = nftSubmissionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request payload',
        errors: result.error.errors,
      });
      return;
    }

    const { blockchain, user_wallet, nft, simulate }: NFTSubmissionPayload = result.data;

    const createdNFT = await createNFT(
      {
        blockchain,
        userWallet: user_wallet,
        name: nft.name,
        creator: nft.creator,
        supplyRoyalties: nft.supply_royalties,
        description: nft.description,
        mediaUrl: nft.media_url,
        collectionId: nft.collection_id || undefined,
      },
      simulate
    );

    res.status(201).json({
      success: true,
      nftId: createdNFT._id,
      message: simulate
        ? 'NFT created successfully (simulation mode)'
        : 'NFT created successfully and minting process initiated',
    });
    return;
  } catch (error: any) {
    logger.error('Error submitting NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating NFT',
      error: error?.message || 'Unknown error',
    });
    return;
  }
};
