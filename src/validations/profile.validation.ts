import { z } from 'zod';

export const profileUpdateSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long').max(30, 'Username cannot exceed 30 characters'),
    bio: z.string().max(160, 'Bio cannot exceed 160 characters').optional(),
    website: z.string().url('Invalid URL format').optional().or(z.literal('')),
    socials: z.object({
        x: z.string().url('Invalid URL format').optional().or(z.literal('')),
        insta: z.string().url('Invalid URL format').optional().or(z.literal('')),
        discord: z.string().url('Invalid URL format').optional().or(z.literal('')),
        telegram: z.string().url('Invalid URL format').optional().or(z.literal('')),
    }).optional()
    .or(z.literal('')),
});
