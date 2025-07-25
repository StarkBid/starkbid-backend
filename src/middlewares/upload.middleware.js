"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.cloudinaryMulter = void 0;
const multer = require('multer');
// Local temp storage for processing
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
exports.cloudinaryMulter = multer({ dest: "tmp/" });
exports.upload = multer({ storage });
