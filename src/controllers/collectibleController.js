"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCollectible = exports.fetchCollectibles = void 0;
const collectibleService_1 = require("../services/collectibleService");
const logger_1 = require("../utils/logger");
const fetchCollectibles = async (req, res, next) => {
    try {
        const collectibles = await (0, collectibleService_1.getAllCollectibles)();
        res.status(200).json({
            success: true,
            data: collectibles.map(item => ({
                id: item._id,
                name: item.name,
                description: item.description,
                imageUrl: item.imageUrl,
                creator: {
                    id: item.creator._id,
                    firstName: item.creator.firstName,
                    lastName: item.creator.lastName,
                },
                price: item.price,
                currency: item.currency,
            })),
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching collectibles', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.fetchCollectibles = fetchCollectibles;
const fetchCollectible = async (req, res, next) => {
    try {
        const { id } = req.params;
        const collectible = await (0, collectibleService_1.getCollectibleById)(id);
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
                    id: collectible.creator._id,
                    firstName: collectible.creator.firstName,
                    lastName: collectible.creator.lastName,
                },
                price: collectible.price,
                currency: collectible.currency,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching collectible by id', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.fetchCollectible = fetchCollectible;
