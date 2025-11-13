// In src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import sellerRoutes from './routes/seller.routes';
import deliveryRoutes from './routes/delivery.routes';
import { setupSwagger } from './config/swagger';
import { connectDB } from './db';
import { config } from './config/config';

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/delivery', deliveryRoutes);

// Swagger Documentation
if (config.isDevelopment) {
  setupSwagger(app);
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
connectDB();

export default app;