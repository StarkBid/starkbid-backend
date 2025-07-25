import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAuctionById,
  createAuction,
  createAuctionValidators,
  placeBid,
  placeBidValidators,
  getBidHistory,
  getActiveAuctions,
  endAuction
} from '../controllers/auctionController';
// Rate limiting for bid placement
const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 bids per minute per IP
  message: { success: false, message: 'Too many bids, please try again later.' }
});

const router = express.Router();

router.get('/active', getActiveAuctions);
router.get('/:auctionId', getAuctionById);
router.post('/', createAuctionValidators, createAuction);
router.post('/:auctionId/bids', bidLimiter, placeBidValidators, placeBid);
router.get('/:auctionId/bids', getBidHistory);
router.put('/:auctionId/end', endAuction);

export default router;
