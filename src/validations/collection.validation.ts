import { z } from 'zod';

const cloudinaryUrlRegex = /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\/.+$/;

export const createCollectionSchema = z.object({
  coverPhoto: z.string().regex(cloudinaryUrlRegex, 'Cover photo must be a valid Cloudinary URL'),
  profilePhoto: z.string().regex(cloudinaryUrlRegex, 'Profile photo must be a valid Cloudinary URL'),
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long'),
  collectionNumber: z.string().min(1, 'Collection number is required').max(50, 'Number too long'),
  email: z.string().email('Invalid email address'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  collectionUrl: z.string().url('Invalid URL format'),
  xUrl: z.string().url('Invalid X/Twitter URL format').optional(),
  instagramUrl: z.string().url('Invalid Instagram URL format').optional(),
  discordUrl: z.string().url('Invalid Discord URL format').optional(),
  telegramUrl: z.string().url('Invalid Telegram URL format').optional(),
  blockchain: z.enum(['ethereum', 'starknet'])
});

export type CollectionSubmissionPayload = z.infer<typeof createCollectionSchema>; 