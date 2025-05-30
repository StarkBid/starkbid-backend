// import request from 'supertest';
// import mongoose, { Types } from 'mongoose';
// import { app } from '../app';
// import { NFT } from '../models/NFT';
// import { User } from '../models/User';
// import { JwtService } from '../services/jwt.service';

// describe('NFT Submission', () => {
//   let authToken: string;
//   let userId: Types.ObjectId;

//   beforeAll(async () => {
//     // Create a test user
//     const user = await User.create({
//       email: 'test@example.com',
//       password: 'password123',
//       firstName: 'Test',
//       lastName: 'User'
//     });
//     userId = user._id as Types.ObjectId;

//     // Generate auth token
//     authToken = JwtService.generateAccessToken({
//       userId: user._id as Types.ObjectId,
//       email: user.email,
//       role: 'user'
//     });
//   });

//   afterAll(async () => {
//     await User.deleteMany({});
//     await NFT.deleteMany({});
//     await mongoose.connection.close();
//   });

//   beforeEach(async () => {
//     await NFT.deleteMany({});
//   });

//   it('should create an NFT successfully', async () => {
//     const response = await request(app)
//       .post('/api/nfts/submit')
//       .set('Authorization', `Bearer ${authToken}`)
//       .send({
//         blockchain: 'ethereum',
//         user_wallet: '0x1234567890123456789012345678901234567890',
//         nft: {
//           name: 'Test NFT',
//           creator: userId.toString(),
//           supply_royalties: 5,
//           description: 'Test description',
//           media_url: 'https://example.com/image.jpg',
//           collection_id: null
//         }
//       });

//     expect(response.status).toBe(201);
//     expect(response.body.success).toBe(true);
//     expect(response.body.nftId).toBeDefined();
//     expect(response.body.message).toContain('NFT created successfully');

//     const nft = await NFT.findById(response.body.nftId);
//     expect(nft).toBeDefined();
//     expect(nft?.name).toBe('Test NFT');
//     expect(nft?.mintStatus).toBe('pending');
//   });

//   it('should validate required fields', async () => {
//     const response = await request(app)
//       .post('/api/nfts/submit')
//       .set('Authorization', `Bearer ${authToken}`)
//       .send({
//         blockchain: 'ethereum',
//         user_wallet: '0x1234567890123456789012345678901234567890',
//         nft: {
//           // Missing required fields
//           description: 'Test description',
//           media_url: 'https://example.com/image.jpg'
//         }
//       });

//     expect(response.status).toBe(400);
//     expect(response.body.success).toBe(false);
//     expect(response.body.errors).toBeDefined();
//   });

//   it('should handle simulation mode', async () => {
//     const response = await request(app)
//       .post('/api/nfts/submit')
//       .set('Authorization', `Bearer ${authToken}`)
//       .send({
//         blockchain: 'ethereum',
//         user_wallet: '0x1234567890123456789012345678901234567890',
//         nft: {
//           name: 'Test NFT',
//           creator: userId.toString(),
//           supply_royalties: 5,
//           description: 'Test description',
//           media_url: 'https://example.com/image.jpg',
//           collection_id: null
//         },
//         simulate: true
//       });

//     expect(response.status).toBe(201);
//     expect(response.body.success).toBe(true);
//     expect(response.body.message).toContain('simulation mode');

//     const nft = await NFT.findById(response.body.nftId);
//     expect(nft).toBeDefined();
//     expect(nft?.mintStatus).toBe('minted');
//   });

//   it('should require authentication', async () => {
//     const response = await request(app)
//       .post('/api/nfts/submit')
//       .send({
//         blockchain: 'ethereum',
//         user_wallet: '0x1234567890123456789012345678901234567890',
//         nft: {
//           name: 'Test NFT',
//           creator: userId.toString(),
//           supply_royalties: 5,
//           description: 'Test description',
//           media_url: 'https://example.com/image.jpg',
//           collection_id: null
//         }
//       });

//     expect(response.status).toBe(401);
//   });
// }); 