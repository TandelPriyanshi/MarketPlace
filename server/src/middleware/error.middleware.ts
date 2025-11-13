import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface HttpException extends Error {
  status?: number;
  statusCode?: number;
  message: string;
  stack?: string;
}

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Something went wrong';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.error(error.stack);
    }

    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  } catch (err) {
    next(err);
  }
};
