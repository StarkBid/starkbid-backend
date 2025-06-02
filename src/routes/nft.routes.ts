import { Router } from 'express';
import { submitNFT } from '../controllers/nft.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/nfts/submit
router.post('/submit', submitNFT);

export default router; 