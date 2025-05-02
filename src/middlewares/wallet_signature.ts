"use strict";

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export function walletSignatureVerifier(req: Request, res: Response, next: NextFunction): void {
    const { signature, message, publicKey } = req.body;

    if (!signature || !message || !publicKey) {
        res.status(400).json({ message: 'Missing signature, message, or public key' });
        return;
    }

    try {
        const isValid = crypto.verify(
            'sha256',
            Buffer.from(message),
            publicKey,
            Buffer.from(signature, 'base64')
        );

        if (!isValid) {
            res.status(401).json({ message: 'Invalid wallet signature' });
            return;
        }

        next();
    } catch (error: any) {
        res.status(500).json({ message: 'Error verifying signature', error: error.message });
    }
}