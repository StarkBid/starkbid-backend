import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { invalidateCachedImage } from "./cache";

const SIZES = [300, 600, 1200]; // thumbnail, medium, large
export async function optimizeImage(filePath: string, outputDir: string, baseName: string) {
  const outputs: Record<string, string> = {};

  for (const size of SIZES) {
    const outputFile = path.join(outputDir, `${baseName}-${size}.webp`);
    console.log(`Optimizing image to ${outputFile}`);
    await sharp(filePath)
      .resize({ width: size })
      .webp({ quality: 80 })
      .toFile(outputFile);

      outputs[size] = outputFile;
  }

  return outputs;
}

export async function invalidateLocalImages(baseFileName: string) {
  for (const size of SIZES) {
    const filePath = path.join(__dirname, "..", "..", "uploads", `${baseFileName}-${size}.webp`);
    try {
      await fs.unlink(filePath);
      console.log(`Deleted local image: ${filePath}`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }

  await invalidateCachedImage(baseFileName);
  console.log(`Invalidated cache for ${baseFileName}`);
}