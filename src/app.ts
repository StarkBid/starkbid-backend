import express from 'express';
import config from './config/config';
import mongoConnect from './config/monogo-connector';
import walletRoutes from './routes/walletRoutes';
import authRoutes from './routes/authRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});


function startServer() {
  mongoConnect().then(() => {
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  }).catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
}

startServer();
