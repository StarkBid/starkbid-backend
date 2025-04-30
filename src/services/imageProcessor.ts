import sharp from "sharp";
import path from "path";

const SIZES = [300, 600, 1200]; // thumbnail, medium, large
export async function optimizeImage(filePath: string, outputDir: string, baseName: string) {
  const outputs: Record<string, string> = {};

  for (const size of SIZES) {
    const outputFile = path.join(outputDir, `${baseName}-${size}.webp`);
    await sharp(filePath)
      .resize({ width: size })
      .webp({ quality: 80 })
      .toBuffer();

      outputs[size] = outputFile;
  }

  return outputs;
}