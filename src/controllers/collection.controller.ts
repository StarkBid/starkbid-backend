import { Request, Response } from 'express';
import {createCollectionSchema, CollectionSubmissionPayload} from '../validations/collection.validation';
import { logger } from '../utils/logger';
import { createCollection } from '../services/collection.service';

export const submitCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request payload
    const validationResult = createCollectionSchema.safeParse(req.body) as { success: boolean, data: CollectionSubmissionPayload, error: any };
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid request payload',
        errors: validationResult.error.errors
      });
      return;
    }

    const user = req.user;

    if (!user || !user.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found'
      });
      return;
    }

    const payload: CollectionSubmissionPayload = validationResult.data;
  
    const createdCollection = await createCollection(
      {
        coverPhoto: payload.coverPhoto,
        profilePhoto: payload.profilePhoto,
        name: payload.name,
        collectionNumber: payload.collectionNumber,
        email: payload.email,
        description: payload.description,
        collectionUrl: payload.collectionUrl,
        xUrl: payload.xUrl,
        instagramUrl: payload.instagramUrl,
        discordUrl: payload.discordUrl,
        telegramUrl: payload.telegramUrl,
        blockchain: payload.blockchain
      }, 
      user.userId,
    );

    res.status(201).json({
      success: true,
      collection: {
        _id: createdCollection._id,
        name: createCollection.name,
        collectionNumber: createdCollection.collectionNumber,
        coverPhotoUrl: createdCollection.coverPhotoUrl,
        profilePhotoUrl: createdCollection.profilePhotoUrl,
      },
      message: 'Collection created successfully'
    });
  } catch (error) {
    logger.error('Error creating Collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 