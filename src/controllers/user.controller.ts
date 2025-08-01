import { Response } from "express";
import { sanitizeSocials, sanitizeText } from "../utils/sanitize";
import { isValidImageType } from "../validations/media.validation";
import { invalidateCloudinaryImage, uploadImageToCloudinary } from "../services/cloudinary.service";
import { User } from "../models/User";
import { profileUpdateSchema } from "../validations/profile.validation";

export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const parsedData = profileUpdateSchema.parse({
        username: req.body.username,
        bio: req.body.bio,
        website: req.body.website,
        socials: req.body.socials ? JSON.parse(req.body.socials) : {},
      });

      const sanitizedData: {
        username: string;
        bio: string;
        website: string;
        socials: { x: string; insta: string; discord: string; telegram: string; };
        profilePhoto?: any;
        coverPhoto?: any;
      } = {
        username: sanitizeText(parsedData.username),
        bio: sanitizeText(parsedData.bio || ''),
        website: sanitizeText(parsedData.website || ''),
        socials: sanitizeSocials(parsedData.socials || {}),
      };

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Unable to retrieve user!' });
        return;
      }

      if (req.files?.profile) {
        const profileImg = req.files.profile[0];
        if (!isValidImageType(profileImg.mimetype)) throw new Error('Invalid profile image type');
        if (user.profilePhoto?.publicId) {
          await invalidateCloudinaryImage(user.profilePhoto.publicId);
        }

        const uploaded = await uploadImageToCloudinary(profileImg.path, 'profile_photos');
        sanitizedData.profilePhoto = uploaded;
      }

      if (req.files?.cover) {
        const coverImg = req.files.cover[0];
        if (!isValidImageType(coverImg.mimetype)) throw new Error('Invalid cover image type');

        if (user.coverPhoto?.publicId) {
          await invalidateCloudinaryImage(user.coverPhoto.publicId);
        }

        const uploaded = await uploadImageToCloudinary(coverImg.path, 'cover_photos');
        sanitizedData.coverPhoto = uploaded;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, sanitizedData, { new: true });
      res.status(200).json({ success: true, user: updatedUser });
      return;
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ success: false, message: err.message || 'Failed to update profile' });
      return;
    }
}
