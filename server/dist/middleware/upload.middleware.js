"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
// src/middleware/upload.middleware.ts
const multer_1 = __importDefault(require("multer"));
const logger_1 = require("../utils/logger");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
const uploadFile = (fieldName) => {
    return (req, res, next) => {
        const uploadSingle = upload.single(fieldName);
        uploadSingle(req, res, (err) => {
            if (err) {
                logger_1.logger.error('File upload error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error uploading file',
                });
            }
            next();
        });
    };
};
exports.uploadFile = uploadFile;
