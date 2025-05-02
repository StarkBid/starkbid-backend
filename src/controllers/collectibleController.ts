import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getAllCollectibles, getCollectibleById } from '../services/collectibleService';
import { logger } from '../utils/logger';

export const fetchCollectibles: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const collectibles = await getAllCollectibles();
    res.status(200).json({
      success: true,
      data: collectibles.map(item => ({
        id: item._id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        creator: {
          id: (item.creator as any)._id,
          firstName: (item.creator as any).firstName,
          lastName: (item.creator as any).lastName,
        },
        price: item.price,
        currency: item.currency,
      })),
    });
  } catch (error) {
    logger.error('Error fetching collectibles', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const fetchCollectible: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const collectible = await getCollectibleById(id);
    if (!collectible) {
      res.status(404).json({ success: false, message: 'Collectible not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        id: collectible._id,
        name: collectible.name,
        description: collectible.description,
        imageUrl: collectible.imageUrl,
        creator: {
          id: (collectible.creator as any)._id,
          firstName: (collectible.creator as any).firstName,
          lastName: (collectible.creator as any).lastName,
        },
        price: collectible.price,
        currency: collectible.currency,
      },
    });
  } catch (error) {
    logger.error('Error fetching collectible by id', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
