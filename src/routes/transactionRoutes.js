"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_service_1 = require("../services/transaction_service");
const router = express_1.default.Router();
/**
 * Endpoint to fetch transaction history for a wallet.
 */
router.get('/history/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
    try {
        const transactions = await (0, transaction_service_1.getTransactionHistory)(walletAddress);
        res.status(200).json({ walletAddress, transactions });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch transaction history', error: error.message });
    }
});
exports.default = router;
