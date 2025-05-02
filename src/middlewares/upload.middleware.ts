const multer = require('multer');
import path from "path";

// Local temp storage for processing
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

export const cloudinaryMulter = multer({ dest: "tmp/" });

export const upload = multer({ storage });