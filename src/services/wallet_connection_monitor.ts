"use strict";

interface ConnectionStatus {
    status: string;
    timestamp: Date | null;
}

const connections: Map<string, ConnectionStatus> = new Map();

/**
 * Update the connection status of a wallet.
 * @param walletAddress - The wallet address.
 * @param status - The connection status (e.g., "connected", "disconnected").
 */
export function updateConnectionStatus(walletAddress: string, status: string): void {
    connections.set(walletAddress, { status, timestamp: new Date() });
}

/**
 * Get the connection status of a wallet.
 * @param walletAddress - The wallet address.
 * @returns The connection status and timestamp.
 */
export function getConnectionStatus(walletAddress: string): ConnectionStatus {
    return connections.get(walletAddress) || { status: 'disconnected', timestamp: null };
}