"use strict";

import express, { Request, Response } from 'express';
import { getTransactionHistory } from '../services/transaction_service';

const router = express.Router();

/**
 * Endpoint to fetch transaction history for a wallet.
 */
router.get('/history/:walletAddress', async (req: Request, res: Response) => {
    const { walletAddress } = req.params;

    try {
        const transactions = await getTransactionHistory(walletAddress);
        res.status(200).json({ walletAddress, transactions });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch transaction history', error: error.message });
    }
});

export default router;