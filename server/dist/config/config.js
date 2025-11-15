"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.currentConfig = void 0;
// src/config/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const baseConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'marketplace',
    },
    uploads: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    },
};
const config = {
    development: {
        ...baseConfig,
        db: {
            ...baseConfig.db,
            dialect: 'mysql',
            logging: console.log,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        },
    },
    test: {
        ...baseConfig,
        db: {
            ...baseConfig.db,
            database: 'marketplace_test',
            dialect: 'mysql',
            logging: false,
        },
    },
    production: {
        ...baseConfig,
        db: {
            ...baseConfig.db,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 10,
                min: 2,
                acquire: 30000,
                idle: 10000,
            },
        },
    },
};
exports.config = config;
// Update the export in config.ts
exports.currentConfig = config[process.env.NODE_ENV || 'development'];
