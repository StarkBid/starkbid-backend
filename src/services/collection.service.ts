import {COLLECTION, ICollection} from "../models/Collection";
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

export const createCollection = async (
  payload: {
    coverPhoto: string;
    profilePhoto: string;
    name: string;
    email: string;
    description: string;
    collectionUrl: string;
    collectionNumber: string;
    xUrl?: string;
    instagramUrl?: string;
    discordUrl?: string;
    telegramUrl?: string;
    blockchain: 'ethereum' | 'starknet';
  },
  userId: Types.ObjectId,
): Promise<ICollection> => {
  try {
    const collection = new COLLECTION({
      coverPhotoUrl: payload.coverPhoto,
      profilePhotoUrl: payload.profilePhoto,
      name: payload.name,
      email: payload.email,
      description: payload.description,
      collectionNumber: payload.collectionNumber,
      collectionUrl: payload.collectionUrl,
      socialLinks: {
        x: payload.xUrl || '',
        instagram: payload.instagramUrl || '',
        discord: payload.discordUrl || '',
        telegram: payload.telegramUrl || ''
      },
      creatorId: userId,
      blockchain: payload.blockchain,
      standard: 'ERC-721',
      isVerified: false
    });

    const savedCollection = await collection.save();

    return savedCollection;
  } catch (error) {
    logger.error('Error creating collection:', error);
    throw error;
  }
}