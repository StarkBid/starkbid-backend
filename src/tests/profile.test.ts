import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import cloudinary from '../config/cloudinary';
import mongoose, { Types } from 'mongoose';
import { SessionService } from '../services/session.service';
import { JwtService } from '../services/jwt.service';
import { closeRedisConnection } from '../services/cache';

// Mock Cloudinary
jest.mock('../config/cloudinary');
const mockedCloudinary = cloudinary as jest.Mocked<typeof cloudinary>;

describe('User Profile Update', () => {
  let token: string;
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
    token = tokens.accessToken;
    sessionService.createSession(user._id as Types.ObjectId, tokens.accessToken, tokens.refreshToken);
    }, 25000);

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close(true);
    // Clear the session cache
        const instance = SessionService.getInstance();
        instance.invalidateAllUserSessions(userId);
        instance.clear();

        // Close Redis connection
        await closeRedisConnection();
    }, 25000);

  it('should update profile with valid data and images', async () => {
    // Mock Cloudinary upload responses
    (mockedCloudinary.uploader.upload as jest.Mock).mockImplementation(async () => ({
      secure_url: 'https://res.cloudinary.com/fake-image.jpg',
      public_id: 'profile_photos/fake123',
    }));

    (mockedCloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

    const response = await request(app)
      .put('/api/users/profile/edit')
      .set('Authorization', `Bearer ${token}`)
      .field('username', 'newuser')
      .field('bio', 'new bio')
      .field('website', 'https://newsite.com')
      .field(
        'socials',
        JSON.stringify({
          x: 'https://twitter.com/new',
          insta: 'https://instagram.com/new',
        })
      )
      .attach('profile', 'src/tests/fixtures/test-profile.png')
      .attach('cover', 'src/tests/fixtures/test-cover.jpg');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe('newuser');
    expect(response.body.user.profilePhoto.url).toContain('res.cloudinary.com');
    expect(mockedCloudinary.uploader.upload).toHaveBeenCalledTimes(2);
  });

  it('should fail with invalid URL in socials', async () => {
    const response = await request(app)
      .put('/api/users/profile/edit')
      .set('Authorization', `Bearer ${token}`)
      .field('username', 'baduser')
      .field('website', 'https://newsite.com')
      .field(
        'socials',
        JSON.stringify({
          x: 'not-a-valid-url',
        })
      );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Invalid input/i);
  });

  it('should fail if no token provided', async () => {
    const response = await request(app)
      .put('/api/users/profile/edit')
      .field('username', 'user');

    expect(response.status).toBe(401);
  });
});
