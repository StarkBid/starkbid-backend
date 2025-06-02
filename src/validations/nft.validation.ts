import { z } from 'zod';
import { Types } from 'mongoose';

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

export const nftSubmissionSchema = z.object({
  blockchain: z.enum(['ethereum', 'starknet']),
  user_wallet: z.string().min(1, 'Wallet address is required'),
  nft: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    creator: z.string().refine(isValidObjectId, 'Invalid creator ID'),
    supply_royalties: z.number()
      .min(0, 'Royalties must be at least 0%')
      .max(100, 'Royalties cannot exceed 100%'),
    description: z.string().optional(),
    media_url: z.string().url('Invalid media URL'),
    collection_id: z.string()
      .refine(isValidObjectId, 'Invalid collection ID')
      .optional()
      .nullable(),
  }),
  simulate: z.boolean().optional().default(false),
});

export type NFTSubmissionPayload = z.infer<typeof nftSubmissionSchema>; 