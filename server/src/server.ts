import 'reflect-metadata';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import App from './app';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create and start the server
const server = new App(Number(PORT));
server.listen();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Error: ${err.message}`);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});
