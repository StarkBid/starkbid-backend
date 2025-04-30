import path from "path";
import { optimizeImage } from "../services/imageProcessor";
import { setCachedImage } from "../services/cache";

export const imageUploadController = async (req: any, res: any) => {
  const filePath = req.file?.path;
  const baseName = path.parse(req.file!.filename).name;
  const outputDir = path.join(__dirname, "uploads");

  const optimizedPaths = await optimizeImage(filePath, outputDir, baseName);
  await setCachedImage(`image:${baseName}`, JSON.stringify(optimizedPaths), 60 * 60 * 24); // Cache for 1 day

  res.json({ success: true, images: optimizedPaths });
  return;
}