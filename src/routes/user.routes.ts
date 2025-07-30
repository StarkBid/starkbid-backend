import { Router } from 'express';
import {
  getUserProfile,
  getCreatedNFTs,
  getOwnedNFTs,
  getActiveBids,
  getAuctionHistory,
  getUserWallets
} from '../controllers/user.controller';

const router = Router();

router.get('/:userId', getUserProfile);
router.get('/:userId/created-nfts', getCreatedNFTs);
router.get('/:userId/owned-nfts', getOwnedNFTs);
router.get('/:userId/active-bids', getActiveBids);
router.get('/:userId/auction-history', getAuctionHistory);
router.get('/:userId/wallets', getUserWallets);

export default router;
