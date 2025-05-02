"use strict";

import axios from 'axios';

/**
 * Fetch blockchain events for a specific wallet address.
 * @param walletAddress - The wallet address to query.
 * @returns A list of raw blockchain events.
 */
export async function fetchBlockchainEvents(walletAddress: string): Promise<any[]> {
    try {
        const response = await axios.get<{ events: any[] }>(`https://starknet-api.example.com/events?wallet=${walletAddress}`);
        return response.data.events;
    } catch (error) {
        console.error('Error fetching blockchain events:', error);
        throw new Error('Failed to fetch blockchain events');
    }
}