"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config/config"));
const monogo_connector_1 = __importDefault(require("./config/monogo-connector"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
// Error handling middleware 
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
function startServer() {
    (0, monogo_connector_1.default)().then(() => {
        app.listen(config_1.default.port, () => {
            logger_1.logger.info(`Server running on port ${config_1.default.port}`);
        });
    }).catch((error) => {
        logger_1.logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });
}
startServer();
