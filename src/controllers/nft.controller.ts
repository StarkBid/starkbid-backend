import { Request, Response } from 'express';
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