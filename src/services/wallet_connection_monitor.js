"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConnectionStatus = updateConnectionStatus;
exports.getConnectionStatus = getConnectionStatus;
const connections = new Map();
/**
 * Update the connection status of a wallet.
 * @param walletAddress - The wallet address.
 * @param status - The connection status (e.g., "connected", "disconnected").
 */
function updateConnectionStatus(walletAddress, status) {
    connections.set(walletAddress, { status, timestamp: new Date() });
}
/**
 * Get the connection status of a wallet.
 * @param walletAddress - The wallet address.
 * @returns The connection status and timestamp.
 */
function getConnectionStatus(walletAddress) {
    return connections.get(walletAddress) || { status: 'disconnected', timestamp: null };
}
