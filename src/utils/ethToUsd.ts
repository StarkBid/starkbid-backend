import axios from 'axios';

export async function ethToUsd(ethAmount: number): Promise<number> {
  try {
    // Example using CoinGecko API
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'ethereum',
        vs_currencies: 'usd'
      }
    });
    const rate = response.data?.ethereum?.usd || 0;
    return ethAmount * rate;
  } catch (err) {
    // Fallback: return 0 if API fails
    return 0;
  }
}
