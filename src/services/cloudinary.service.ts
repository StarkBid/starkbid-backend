import cloudinary from "../config/cloudinary";

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