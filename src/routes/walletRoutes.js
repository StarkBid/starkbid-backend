"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_signature_1 = require("../middlewares/wallet_signature");
const wallet_provider_detector_1 = require("../utils/wallet_provider_detector");
const wallet_connection_monitor_1 = require("../services/wallet_connection_monitor");
const walletControllers_1 = require("../controllers/walletControllers");
const router = express_1.default.Router();
router.post('/verify', (req, res) => {
    (0, walletControllers_1.verifyWallet)(req, res);
});
router.post('/connect', wallet_signature_1.walletSignatureVerifier, (req, res) => {
    const { walletAddress } = req.body;
    const provider = (0, wallet_provider_detector_1.detectWalletProvider)(req.headers['user-agent'] || '');
    if (!walletAddress) {
        res.status(400).json({ message: 'Wallet address is required' });
        return;
    }
    (0, wallet_connection_monitor_1.updateConnectionStatus)(walletAddress, 'connected');
    res.status(200).json({ message: 'Wallet connected', provider });
});
router.post('/disconnect', (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        res.status(400).json({ message: 'Wallet address is required' });
        return;
    }
    (0, wallet_connection_monitor_1.updateConnectionStatus)(walletAddress, 'disconnected');
    res.status(200).json({ message: 'Wallet disconnected' });
});
router.get('/status/:walletAddress', (req, res) => {
    const { walletAddress } = req.params;
    const status = (0, wallet_connection_monitor_1.getConnectionStatus)(walletAddress);
    res.status(200).json({ walletAddress, status });
});
exports.default = router;
