import { getEthUsdPrice, convertEthToUsd } from '../services/price.service';

describe('Price Service', () => {
  it('should fetch ETH/USD price', async () => {
    const price = await getEthUsdPrice();
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);
  });

  it('should convert ETH to USD', async () => {
    const usd = await convertEthToUsd(1);
    expect(typeof usd).toBe('number');
    expect(usd).toBeGreaterThan(0);
  });
});
