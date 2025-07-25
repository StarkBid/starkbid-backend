"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectibleById = exports.getAllCollectibles = void 0;
const Collectible_1 = require("../models/Collectible");
const getAllCollectibles = async () => {
    return Collectible_1.Collectible.find()
        .populate('creator', 'firstName lastName email')
        .exec();
};
exports.getAllCollectibles = getAllCollectibles;
const getCollectibleById = async (id) => {
    return Collectible_1.Collectible.findById(id)
        .populate('creator', 'firstName lastName email')
        .exec();
};
exports.getCollectibleById = getCollectibleById;
