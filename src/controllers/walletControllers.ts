import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Wallet from '../models/Wallet';
import User from '../models/User';
import cache from '../utils/cache';

const isValidStarknetAddress = (addr: string) =>
  /^0x[0-9a-fA-F]{64}$/.test(addr);

export const verifyWallet = async (req: Request, res: Response): Promise<Response<any>> => {
  try {
    const { address, userId } = req.body;

    if (!address || !userId) {
      return res.status(400).json({
        status: 'error',
        message: 'address and userId required',
      });
    }


    if (!isValidStarknetAddress(address)) {
      return res.status(400).json({
        status: 'invalid',
        message: 'Bad Starknet address format',
      });
    }

 
    let validUserId;
    try {
      validUserId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        status: 'invalid',
        message: 'Invalid userId format',
      });
    }

    const cacheKey = `wallet:${address}`;
    
    // Check if the wallet data is cached
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      return res.status(200).json({ status: 'cached', data: cached });
    }

    // Check if wallet already exists
    let wallet = await Wallet.findOne({ address });
    
    // If wallet is not found, handle the case where wallet is null or undefined
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found',
      });
    }

    // Check if the wallet is linked to a different user
    if (wallet.userId && wallet.userId.toString() !== validUserId.toString()) {
      return res.status(409).json({
        status: 'conflict',
        message: 'Wallet already linked to another user',
      });
    }

    // Link wallet (or create+link)
    wallet = await Wallet.findOneAndUpdate(
      { address },
      { address, userId: validUserId, status: 'linked' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Add wallet reference to the user
    await User.findByIdAndUpdate(validUserId, {
      $addToSet: { wallets: wallet?._id },
    });

    // Cache the wallet data
    cache.set(cacheKey, wallet);

    // Return the linked wallet
    return res.status(200).json({ status: 'linked', data: wallet });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: err,
    });
  }
};
