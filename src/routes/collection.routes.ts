import { Router } from 'express';
import { submitCollection } from '../controllers/collection.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// POST /api/collection/create
router.post('/create', authenticateToken, submitCollection);

export default router;