"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitNFT = void 0;
const nft_validation_1 = require("../validations/nft.validation");
const nft_service_1 = require("../services/nft.service");
const logger_1 = require("../utils/logger");
const submitNFT = async (req, res) => {
    try {
        // Validate request payload
        const validationResult = nft_validation_1.nftSubmissionSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid request payload',
                errors: validationResult.error.errors
            });
            return;
        }
        const payload = validationResult.data;
        const { blockchain, user_wallet, nft, simulate } = payload;
        // Create NFT
        const createdNFT = await (0, nft_service_1.createNFT)({
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
    }
    catch (error) {
        logger_1.logger.error('Error submitting NFT:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating NFT',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.submitNFT = submitNFT;
