import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export async function optimizeImage(buffer: Buffer, filename: string) {
  const sizes = [300, 600, 1200]; // thumbnail, medium, large
  const outputs: Record<string, string> = {};

  for (const size of sizes) {
    const outputPath = path.resolve("uploads/optimized", `${filename}-${size}.webp`);
    const optimized = await sharp(buffer)
      .resize({ width: size })
      .webp({ quality: 80 })
      .toBuffer();

      await fs.writeFile(outputPath, optimized);
      outputs[size] = `uploads/optimized/${filename}-${size}.webp`;
  }

  return outputs;
}