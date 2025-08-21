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

const userRouter = Router();


userRouter.get('/:userId', getUserProfile);
userRouter.get('/:userId/created-nfts', getCreatedNFTs);
userRouter.get('/:userId/owned-nfts', getOwnedNFTs);
userRouter.get('/:userId/active-bids', getActiveBids);
userRouter.get('/:userId/auction-history', getAuctionHistory);
userRouter.get('/:userId/wallets', getUserWallets);

userRouter.put('/profile/edit', authenticateToken, profileEditLimiter, uploadAlt.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), updateProfile);

export default userRouter;
