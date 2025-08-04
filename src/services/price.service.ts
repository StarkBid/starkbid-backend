import axios from 'axios';

export async function getEthUsdPrice(): Promise<number> {
  // Use a public API for ETH/USD price
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    return response.data.ethereum.usd;
  } catch (err) {
    return 0;
  }
}

export async function convertEthToUsd(amountEth: number): Promise<number> {
  const price = await getEthUsdPrice();
  return +(amountEth * price).toFixed(2);
}
