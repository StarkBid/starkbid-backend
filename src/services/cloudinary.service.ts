import cloudinary from "../config/cloudinary";
import fs from 'fs/promises';

export const uploadToCloudinary = async (filePath: string, publicId: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    folder: "nft-images",
    transformation: [
      { width: 600, crop: 'scale', fetch_format: 'auto', quality: 'auto' },
    ],
    overwrite: true,
    invalidate: true,
  });

  return result.secure_url;
}

export const uploadImageToCloudinary = async (filePath: string, folder: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
  });

  await fs.unlink(filePath); // Remove temp file
  return result.secure_url;
}

export const invalidateCloudinaryImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true })
    console.log(`Cloudinary image invalidated: ${publicId}`);
  } catch (error) {
    console.error('Error deleting cloudinary image:', error);
  }
}
