"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHistory = getTransactionHistory;
const cache_1 = require("../utils/cache"); // A simple caching utility
const blockchain_fetcher_1 = require("../utils/blockchain_fetcher"); // Utility to query Starknet blockchain
/**
 * Fetch and process transaction data from the blockchain.
 * @param walletAddress - The wallet address to fetch transactions for.
 * @returns A list of formatted transactions.
 */
async function getTransactionHistory(walletAddress) {
    // Check cache first
    const cachedData = cache_1.Cache.get(walletAddress);
    if (cachedData) {
        return cachedData;
    }
    // Fetch raw blockchain events
    const rawEvents = await (0, blockchain_fetcher_1.fetchBlockchainEvents)(walletAddress);
    // Process and format the raw data
    const transactions = rawEvents.map((event) => ({
        type: event.type,
        timestamp: new Date(event.timestamp * 1000), // Convert UNIX timestamp to Date
        walletAddress: event.walletAddress,
        assetDetails: `${event.assetName} (${event.assetSymbol})`,
        price: formatCryptoValue(event.price, event.assetSymbol),
    }));
    // Cache the processed data
    cache_1.Cache.set(walletAddress, transactions);
    return transactions;
}
/**
 * Format cryptocurrency values appropriately.
 * @param value - The raw value.
 * @param symbol - The cryptocurrency symbol.
 * @returns A formatted string.
 */
function formatCryptoValue(value, symbol) {
    return `${value.toFixed(4)} ${symbol}`;
}
