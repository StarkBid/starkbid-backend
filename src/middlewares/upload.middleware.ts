const multer = require('multer');
import path from "path";

// Local temp storage for processing
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

export const cloudinaryMulter = multer({ dest: "tmp/" });

export const upload = multer({ storage });

const storageAlt = multer.diskStorage({
  destination: 'tmp/',
  filename: (_: any, file: any, cb: any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploadAlt = multer({
  storage: storageAlt,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});
