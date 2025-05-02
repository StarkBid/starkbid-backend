import { Router } from 'express';
import { fetchCollectibles, fetchCollectible } from '../controllers/collectibleController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// GET /api/collectibles
router.get('/', authenticate, fetchCollectibles);

// GET /api/collectibles/:id
router.get('/:id', authenticate, fetchCollectible);

export default router;