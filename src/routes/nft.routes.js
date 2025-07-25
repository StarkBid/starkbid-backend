"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nft_controller_1 = require("../controllers/nft.controller");
const router = (0, express_1.Router)();
// POST /api/nfts/submit
router.post('/submit', nft_controller_1.submitNFT);
exports.default = router;
