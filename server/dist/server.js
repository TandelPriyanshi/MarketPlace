"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = require("http");
const logger_1 = require("./utils/logger");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
// Create HTTP server
const server = (0, http_1.createServer)(app_1.default);
// Start the server
server.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server is running on port ${env_1.env.PORT}`);
    logger_1.logger.info(`API Documentation available at http://localhost:${env_1.env.PORT}/api-docs`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error(`Error: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error(`Error: ${err.message}`);
    process.exit(1);
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Shutting down gracefully');
    process.exit(0);
});
