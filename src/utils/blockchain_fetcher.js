"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBlockchainEvents = fetchBlockchainEvents;
const axios_1 = __importDefault(require("axios"));
/**
 * Fetch blockchain events for a specific wallet address.
 * @param walletAddress - The wallet address to query.
 * @returns A list of raw blockchain events.
 */
async function fetchBlockchainEvents(walletAddress) {
    try {
        const response = await axios_1.default.get(`https://starknet-api.example.com/events?wallet=${walletAddress}`);
        return response.data.events;
    }
    catch (error) {
        console.error('Error fetching blockchain events:', error);
        throw new Error('Failed to fetch blockchain events');
    }
}
