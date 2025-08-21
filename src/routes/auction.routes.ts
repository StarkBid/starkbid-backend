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

const auctionRouter = Router(); 
// Auction routes
auctionRouter.get('/nfts/:nftId/auction', getAuctionByNFT);
auctionRouter.get('/:auctionId', getAuctionById);  
auctionRouter.post('/', createAuction);  
auctionRouter.post('/:auctionId/bids', rateLimit, placeBid);  
auctionRouter.get('/:auctionId/bids', getBidHistory);  
auctionRouter.put('/:auctionId/end', endAuction);  
auctionRouter.get('/active', getActiveAuctions)

export default auctionRouter;  
