"use strict";

/**
 * Detect wallet provider based on request headers or payload.
 * @param userAgent - The user-agent string from the request headers.
 * @returns The detected wallet provider.
 */
export function detectWalletProvider(userAgent: string): string {
    if (userAgent.includes('MetaMask')) {
        return 'MetaMask';
    } else if (userAgent.includes('WalletConnect')) {
        return 'WalletConnect';
    } else if (userAgent.includes('Coinbase')) {
        return 'Coinbase Wallet';
    }
    return 'Unknown';
}