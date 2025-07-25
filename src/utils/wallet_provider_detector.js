"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectWalletProvider = detectWalletProvider;
/**
 * Detect wallet provider based on request headers or payload.
 * @param userAgent - The user-agent string from the request headers.
 * @returns The detected wallet provider.
 */
function detectWalletProvider(userAgent) {
    if (userAgent.includes('MetaMask')) {
        return 'MetaMask';
    }
    else if (userAgent.includes('WalletConnect')) {
        return 'WalletConnect';
    }
    else if (userAgent.includes('Coinbase')) {
        return 'Coinbase Wallet';
    }
    return 'Unknown';
}
