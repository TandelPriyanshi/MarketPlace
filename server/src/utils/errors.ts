export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, isOperational = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(message, 404, true, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', code?: string) {
    super(message, 400, true, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized', code?: string) {
    super(message, 401, true, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, 403, true, code);
  }
}

export class DatabaseError extends AppError {
  originalError?: Error;
  
  constructor(message = 'Database error', originalError?: Error, code?: string) {
    super(message, 500, true, code);
    this.originalError = originalError;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code?: string) {
    super(message, 409, true, code);
  }
}

export class RateLimitError extends AppError {
  retryAfter: number;
  
  constructor(message = 'Too many requests', retryAfter = 60, code?: string) {
    super(message, 429, true, code);
    this.retryAfter = retryAfter;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code?: string) {
    super(message, 503, true, code);
  }
}

// Type guard for operational errors
export function isOperationalError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational === true;
}

// Global error handler
export function globalErrorHandler(err: any, req: any, res: any, next: any) {
  if (res.headersSent) {
    return next(err);
  }

  // Set default values for unknown errors
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const message = Object.values(err.errors).map((val: any) => val.message).join('. ');
    err = new ValidationError(`Invalid input: ${message}`, 'VALIDATION_ERROR');
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    err = new ValidationError(`Invalid ${err.path}: ${err.value}`, 'INVALID_INPUT');
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    err = new ConflictError(`${field} already in use`, 'DUPLICATE_KEY');
  } else if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
  } else if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');
  } else if (!isOperationalError(err)) {
    // For unhandled errors, log the error and send a generic message
    console.error('ERROR 💥', err);
    err = new AppError('Something went wrong', 500, false);
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    code: err.code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
