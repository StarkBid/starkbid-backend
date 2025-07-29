import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import { app } from '../app';
import { COLLECTION } from '../models/Collection';
import { User } from '../models/User';
import { JwtService } from '../services/jwt.service';
import { SessionService } from '../services/session.service';
import { closeRedisConnection } from '../services/cache';

describe('Collection Creation', () => {
  let authToken: string;
  let userId: Types.ObjectId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/starkbid-test');
    }

    const sessionService = SessionService.getInstance();
    // Create a test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    userId = user._id as Types.ObjectId;

    // Generate tokens
    const tokens = JwtService.generateTokens({
      userId: user._id as Types.ObjectId,
      email: user.email,
      role: 'user'
    });
    authToken = tokens.accessToken;
    sessionService.createSession(user._id as Types.ObjectId, tokens.accessToken, tokens.refreshToken);
  }, 25000);

  afterAll(async () => {
    await User.deleteMany({});
    await COLLECTION.deleteMany({});
    await mongoose.connection.close(true);

    // Clear the session cache
    const instance = SessionService.getInstance();
    instance.invalidateAllUserSessions(userId);
    instance.clear();

    // Close Redis connection
    await closeRedisConnection();
  }, 25000);


  beforeEach(async () => {
    await COLLECTION.deleteMany({});
  }, 25000);

  it('should create a Collection successfully', async () => {
    const response = await request(app)
      .post('/api/collections/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        coverPhoto: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        profilePhoto: 'https://res.cloudinary.com/demo/image/upload/man.jpg',
        name: 'Test Collection',
        collectionNumber: '1',
        email: 'testcollection@gmail.com',
        description: 'This is a test collection',
        collectionUrl: 'https://testcollection.com',
        xUrl: 'https://x.com/testcollection',
        instagramUrl: 'https://instagram.com/testcollection',
        discordUrl: 'https://discord.gg/testcollection',
        telegramUrl: 'https://t.me/testcollection',
        blockchain: 'ethereum',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.collection).toBeDefined();
    expect(response.body.message).toContain('Collection created successfully');

    const collection = await COLLECTION.findById(response.body.collection._id);
    expect(collection).toBeDefined();
    expect(collection?.name).toBe('Test Collection');
    expect(collection?.isVerified).toBe(false);
    expect(collection?.creatorId.toString()).toBe(userId.toString());
  }, 25000);


  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/collections/create')
      .send({
        coverPhoto: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        profilePhoto: 'https://res.cloudinary.com/demo/image/upload/man.jpg',
        name: 'Test Collection',
        collectionNumber: '1',
        email: 'testcollection@gmail.com',
        description: 'This is a test collection',
        collectionUrl: 'https://testcollection.com',
        xUrl: 'https://x.com/testcollection',
        instagramUrl: 'https://instagram.com/testcollection',
        discordUrl: 'https://discord.gg/testcollection',
        telegramUrl: 'https://t.me/testcollection',
        blockchain: 'ethereum',
      });

     expect(response.status).toBe(401);
  }, 25000);


  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/nfts/submit')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        xUrl: 'https://x.com/testcollection',
        instagramUrl: 'https://instagram.com/testcollection',
        discordUrl: 'https://discord.gg/testcollection',
        telegramUrl: 'https://t.me/testcollection',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  }, 25000);
});