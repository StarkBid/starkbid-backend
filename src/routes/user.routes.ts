import { Router } from 'express';
import {
  getUserProfile,
  getCreatedNFTs,
  getOwnedNFTs,
  getActiveBids,
  getAuctionHistory,
  getUserWallets
} from '../controllers/user.controller';
import { authenticateToken } from "../middleware/auth.middleware";
import { profileEditLimiter } from "../middlewares/rateLimiter";
import { uploadAlt } from "../middlewares/upload.middleware";
import { updateProfile } from "../controllers/user.controller";

const router = Router();
const userRouter = Router();


router.get('/:userId', getUserProfile);
router.get('/:userId/created-nfts', getCreatedNFTs);
router.get('/:userId/owned-nfts', getOwnedNFTs);
router.get('/:userId/active-bids', getActiveBids);
router.get('/:userId/auction-history', getAuctionHistory);
router.get('/:userId/wallets', getUserWallets);

userRouter.put('/profile/edit', authenticateToken, profileEditLimiter, uploadAlt.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), updateProfile);

export default router;
export default userRouter;
