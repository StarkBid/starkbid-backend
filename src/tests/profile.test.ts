import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import cloudinary from '../config/cloudinary';
import mongoose from 'mongoose';

// Mock Cloudinary
jest.mock('../config/cloudinary');
const mockedCloudinary = cloudinary as jest.Mocked<typeof cloudinary>;

describe('PUT /profile/edit', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Connect to test DB and create a user
    await mongoose.connect(process.env.MONGO_URI_TEST!);

    const user = await User.create({
      username: 'olduser',
      bio: 'old bio',
      website: 'https://old.com',
      socials: {
        x: 'https://twitter.com/old',
        insta: '',
        discord: '',
        telegram: '',
      },
    });

    userId = (user._id as mongoose.Types.ObjectId).toString();

    token = 'mocked-jwt-token-for-user'; // test token
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('should update profile with valid data and images', async () => {
    // Mock Cloudinary upload responses
    (mockedCloudinary.uploader.upload as jest.Mock).mockImplementation(async () => ({
      secure_url: 'https://res.cloudinary.com/fake-image.jpg',
      public_id: 'profile_photos/fake123',
    }));

    (mockedCloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

    const response = await request(app)
      .put('/profile/edit')
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
      .attach('profile', '__tests__/fixtures/test-profile.jpg')
      .attach('cover', '__tests__/fixtures/test-cover.jpg');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe('newuser');
    expect(response.body.user.profilePhoto.url).toContain('cloudinary.com');
    expect(mockedCloudinary.uploader.upload).toHaveBeenCalledTimes(2);
  });

  it('should fail with invalid URL in socials', async () => {
    const response = await request(app)
      .put('/profile/edit')
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
      .put('/profile/edit')
      .field('username', 'user');

    expect(response.status).toBe(401);
  });
});
