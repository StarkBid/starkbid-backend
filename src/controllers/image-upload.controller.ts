import path from "path";
import fs from "fs/promises";
import { invalidateLocalImages, optimizeImage } from "../services/image.service";
import { invalidateCachedImage, setCachedImage } from "../services/cache";
import { invalidateCloudinaryImage, uploadToCloudinary } from "../services/cloudinary.service";

export const imageUploadController = async (req: any, res: any) => {
  const filePath = req.file?.path;
  const baseName = req.body.logical_name || path.parse(req.file!.filename).name;
  const outputDir = path.join(__dirname, "..", "..", "uploads");

  // invalidate old imaages and cache
  await invalidateLocalImages(baseName); // delete old resized images
  await invalidateCachedImage(`image:${baseName}`); // invalidate cache

  const optimizedPaths = await optimizeImage(filePath, outputDir, baseName);
  // Convert absolute paths to relative URLs
  const publicPaths: Record<string, string> = {};
  Object.entries(optimizedPaths).forEach(([size, absPath]) => {
    publicPaths[size] = `${process.env.APP_URL}/cdn/${path.basename(absPath)}`;
  });
  await setCachedImage(`image:${baseName}`, JSON.stringify(publicPaths));

  res.json({ success: true, images: publicPaths });
  return;
}

export const imageCloudinaryUploadController = async (req: any, res: any) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No image uploaded' });
  const localPath = path.resolve(file.path);
  const logicalName = req.body.logical_name || path.parse(file.originalname).name;
  const imageId = req.body.logical_name ? `img:${logicalName}` : `img:${logicalName}-${Date.now()}`;

  // Invalidate Cloudinary + cache
  await invalidateCachedImage(imageId);
  await invalidateCloudinaryImage(`nft-images/${logicalName}`);

  const cloudinaryUrl = await uploadToCloudinary(localPath, imageId);

  // Build different sizes (on-the-fly variant URLs)
  const baseUploadSegment = '/upload/';
  const thumbUrl = cloudinaryUrl.replace(baseUploadSegment, `${baseUploadSegment}w_300,h_300,c_fill/`);
  const mediumUrl = cloudinaryUrl.replace(baseUploadSegment, `${baseUploadSegment}w_600,h_600,c_fill/`);

  await setCachedImage(imageId, JSON.stringify({
    original: cloudinaryUrl,
    thumbnail: thumbUrl,
    medium: mediumUrl,
  }));

  // Clean up local file after upload
  await fs.unlink(localPath);
  res.json({ 
    success: true,
    message: 'Image uploaded and optimized successfully', 
    data: { 
      id: imageId, 
      original: cloudinaryUrl, 
      thumbnail: thumbUrl, 
      medium: mediumUrl 
    } 
  });
  return;
}