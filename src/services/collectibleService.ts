import { Collectible, ICollectible } from '../models/Collectible';

export const getAllCollectibles = async (): Promise<ICollectible[]> => {
  return Collectible.find()
    .populate('creator', 'firstName lastName email')
    .exec();
};

export const getCollectibleById = async (id: string): Promise<ICollectible | null> => {
  return Collectible.findById(id)
    .populate('creator', 'firstName lastName email')
    .exec();
};