"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nftSubmissionSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const isValidObjectId = (id) => mongoose_1.Types.ObjectId.isValid(id);
exports.nftSubmissionSchema = zod_1.z.object({
    blockchain: zod_1.z.enum(['ethereum', 'starknet']),
    user_wallet: zod_1.z.string().min(1, 'Wallet address is required'),
    nft: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
        creator: zod_1.z.string().refine(isValidObjectId, 'Invalid creator ID'),
        supply_royalties: zod_1.z.number()
            .min(0, 'Royalties must be at least 0%')
            .max(100, 'Royalties cannot exceed 100%'),
        description: zod_1.z.string().optional(),
        media_url: zod_1.z.string().url('Invalid media URL'),
        collection_id: zod_1.z.string()
            .refine(isValidObjectId, 'Invalid collection ID')
            .optional()
            .nullable(),
    }),
    simulate: zod_1.z.boolean().optional().default(false),
});
