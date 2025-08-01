import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { profileEditLimiter } from "../middlewares/rateLimiter";
import { uploadAlt } from "../middlewares/upload.middleware";
import { updateProfile } from "../controllers/user.controller";

const userRouter = Router();

userRouter.put('/profile/edit', authenticateToken, profileEditLimiter, uploadAlt.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), updateProfile);

export default userRouter;
