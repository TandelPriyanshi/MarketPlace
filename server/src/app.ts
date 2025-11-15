// In src/app.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes/index';
import { setupSwagger } from './config/swagger';
import { connectDB } from './db';
import { currentConfig } from './config/config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use(routes);

// Swagger Documentation
if (currentConfig.isDevelopment) {
  setupSwagger(app);
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
connectDB();

export default app;