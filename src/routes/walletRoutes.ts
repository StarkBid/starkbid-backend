// walletRoutes.ts
import express, { Router } from 'express';
import { verifyWallet } from '../controllers/walletControllers';

const router: Router = express.Router();
router.post('/verify', (req, res) => {
    verifyWallet(req, res);
});

export default router;
