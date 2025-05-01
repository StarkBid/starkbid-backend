"use strict";

import express from 'express';
import config from './config/config';
import mongoConnector from './config/monogo-connector';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { logger } from './utils/logger';
import collectibleRoutes from './routes/collectibleRoutes';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/collectibles', collectibleRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({ message: 'Route not found' });
});

function startServer(): void {
    mongoConnector()
        .then(() => {
            app.listen(config.port, () => {
                logger.info(`Server running on port ${config.port}`);
            });
        })
        .catch((error: Error) => {
            logger.error('Failed to connect to MongoDB:', error);
            process.exit(1);
        });
}

startServer();