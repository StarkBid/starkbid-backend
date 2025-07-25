"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config/config"));
const mongo_connector_1 = __importDefault(require("./config/mongo-connector"));
const path_1 = __importDefault(require("path"));
const upload_route_1 = __importDefault(require("./routes/upload.route"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const logger_1 = require("./utils/logger");
const collectibleRoutes_1 = __importDefault(require("./routes/collectibleRoutes"));
const nft_routes_1 = __importDefault(require("./routes/nft.routes"));
exports.app = (0, express_1.default)();
// Middleware
exports.app.use(express_1.default.json());
exports.app.get('/', (req, res) => {
    res.send('Hello from Starkbid API!');
});
exports.app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy!' });
});
exports.app.use('/cdn', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads'), {
    maxAge: 31557600000, // 1 year in milliseconds
    immutable: true,
}));
exports.app.use(upload_route_1.default);
// Routes
exports.app.use('/api/auth', authRoutes_1.default);
exports.app.use('/api/wallets', walletRoutes_1.default);
exports.app.use('/api/collectibles', collectibleRoutes_1.default);
exports.app.use('/api/transactions', transactionRoutes_1.default);
exports.app.use('/api/nfts', nft_routes_1.default);
// Error handling middleware
exports.app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// 404 handler
exports.app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
function startServer() {
    (0, mongo_connector_1.default)().then(() => {
        exports.app.listen(config_1.default.port, () => {
            console.log(`Server running on port ${config_1.default.port}`);
        });
    });
}
// Only start the server if this file is run directly
if (require.main === module) {
    startServer();
}
