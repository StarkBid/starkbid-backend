"use strict";

import express, { Request, Response } from 'express';
import { walletSignatureVerifier } from '../middlewares/wallet_signature';
import { detectWalletProvider } from '../utils/wallet_provider_detector';
import { updateConnectionStatus, getConnectionStatus } from '../services/wallet_connection_monitor';
import { verifyWallet } from '../controllers/walletControllers';

const router = express.Router();

router.post('/verify', (req: Request, res: Response): void => {
    verifyWallet(req, res);
});


router.post('/connect', walletSignatureVerifier, (req: Request, res: Response): void => {
    const { walletAddress } = req.body;
    const provider = detectWalletProvider(req.headers['user-agent'] || '');

    if (!walletAddress) {
        res.status(400).json({ message: 'Wallet address is required' });
        return;
    }

    updateConnectionStatus(walletAddress, 'connected');
    res.status(200).json({ message: 'Wallet connected', provider });
});

router.post('/disconnect', (req: Request, res: Response): void => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        res.status(400).json({ message: 'Wallet address is required' });
        return;
    }

    updateConnectionStatus(walletAddress, 'disconnected');
    res.status(200).json({ message: 'Wallet disconnected' });
});

router.get('/status/:walletAddress', (req: Request, res: Response): void => {
    const { walletAddress } = req.params;
    const status = getConnectionStatus(walletAddress);

    res.status(200).json({ walletAddress, status });
});

export default router;