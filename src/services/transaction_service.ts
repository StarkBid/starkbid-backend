"use strict";

import { Cache } from '../utils/cache'; // A simple caching utility
import { fetchBlockchainEvents } from '../utils/blockchain_fetcher'; // Utility to query Starknet blockchain

interface Transaction {
    type: string;
    timestamp: Date;
    walletAddress: string;
    assetDetails: string;
    price: string;
}

/**
 * Fetch and process transaction data from the blockchain.
 * @param walletAddress - The wallet address to fetch transactions for.
 * @returns A list of formatted transactions.
 */
export async function getTransactionHistory(walletAddress: string): Promise<Transaction[]> {
    // Check cache first
    const cachedData = Cache.get<Transaction[]>(walletAddress);
    if (cachedData) {
        return cachedData;
    }

    // Fetch raw blockchain events
    const rawEvents = await fetchBlockchainEvents(walletAddress);

    // Process and format the raw data
    const transactions: Transaction[] = rawEvents.map((event: any) => ({
        type: event.type,
        timestamp: new Date(event.timestamp * 1000), // Convert UNIX timestamp to Date
        walletAddress: event.walletAddress,
        assetDetails: `${event.assetName} (${event.assetSymbol})`,
        price: formatCryptoValue(event.price, event.assetSymbol),
    }));

    // Cache the processed data
    Cache.set(walletAddress, transactions);

    return transactions;
}

/**
 * Format cryptocurrency values appropriately.
 * @param value - The raw value.
 * @param symbol - The cryptocurrency symbol.
 * @returns A formatted string.
 */
function formatCryptoValue(value: number, symbol: string): string {
    return `${value.toFixed(4)} ${symbol}`;
}