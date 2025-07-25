"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletSignatureVerifier = walletSignatureVerifier;
const crypto = __importStar(require("crypto"));
function walletSignatureVerifier(req, res, next) {
    const { signature, message, publicKey } = req.body;
    if (!signature || !message || !publicKey) {
        res.status(400).json({ message: 'Missing signature, message, or public key' });
        return;
    }
    try {
        const isValid = crypto.verify('sha256', Buffer.from(message), publicKey, Buffer.from(signature, 'base64'));
        if (!isValid) {
            res.status(401).json({ message: 'Invalid wallet signature' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying signature', error: error.message });
    }
}
