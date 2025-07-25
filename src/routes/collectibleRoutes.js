"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collectibleController_1 = require("../controllers/collectibleController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// GET /api/collectibles
router.get('/', auth_1.authenticate, collectibleController_1.fetchCollectibles);
// GET /api/collectibles/:id
router.get('/:id', auth_1.authenticate, collectibleController_1.fetchCollectible);
exports.default = router;
