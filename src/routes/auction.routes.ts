import { Router } from 'express';
import {
  getAuctionByNFT,
  getAuctionById,
  createAuction,
  placeBid,
  getBidHistory,
  endAuction,
  getActiveAuctions
} from '../controllers/auction.controller';
import { rateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Auction routes
router.get('/nfts/:nftId/auction', getAuctionByNFT);
router.get('/auctions/:auctionId', getAuctionById);
router.post('/auctions', createAuction);
router.post('/auctions/:auctionId/bids', rateLimit, placeBid);
router.get('/auctions/:auctionId/bids', getBidHistory);
router.put('/auctions/:auctionId/end', endAuction);
router.get('/auctions/active', getActiveAuctions);

export default router;
