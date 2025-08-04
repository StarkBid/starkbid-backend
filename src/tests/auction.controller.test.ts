import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';

describe('Auction Controller', () => {
  it('should get active auctions', async () => {
    const res = await request(app).get('/api/auctions/active');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return 404 for non-existent auction', async () => {
    const res = await request(app).get('/api/auctions/invalidid');
    expect(res.status).toBe(404);
  });

  // Add more tests for createAuction, placeBid, getBidHistory, endAuction
});
