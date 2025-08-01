const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const isValidImageType = (fileType: string): boolean => {
  return allowedImageTypes.includes(fileType);
}
