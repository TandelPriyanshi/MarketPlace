"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.RateLimitError = exports.ConflictError = exports.DatabaseError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
exports.isOperationalError = isOperationalError;
exports.globalErrorHandler = globalErrorHandler;
class AppError extends Error {
    constructor(message, statusCode, isOperational = true, code) {
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
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code) {
        super(message, 404, true, code);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', code) {
        super(message, 400, true, code);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Not authorized', code) {
        super(message, 401, true, code);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code) {
        super(message, 403, true, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class DatabaseError extends AppError {
    constructor(message = 'Database error', originalError, code) {
        super(message, 500, true, code);
        this.originalError = originalError;
    }
}
exports.DatabaseError = DatabaseError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists', code) {
        super(message, 409, true, code);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter = 60, code) {
        super(message, 429, true, code);
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable', code) {
        super(message, 503, true, code);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
// Type guard for operational errors
function isOperationalError(error) {
    return error instanceof AppError && error.isOperational === true;
}
// Global error handler
function globalErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    // Set default values for unknown errors
    err.statusCode = err.statusCode || 500;
    err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Handle specific error types
    if (err.name === 'ValidationError') {
        // Mongoose validation error
        const message = Object.values(err.errors).map((val) => val.message).join('. ');
        err = new ValidationError(`Invalid input: ${message}`, 'VALIDATION_ERROR');
    }
    else if (err.name === 'CastError') {
        // Mongoose cast error (invalid ObjectId, etc.)
        err = new ValidationError(`Invalid ${err.path}: ${err.value}`, 'INVALID_INPUT');
    }
    else if (err.code === 11000) {
        // MongoDB duplicate key error
        const field = Object.keys(err.keyValue)[0];
        err = new ConflictError(`${field} already in use`, 'DUPLICATE_KEY');
    }
    else if (err.name === 'JsonWebTokenError') {
        err = new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }
    else if (err.name === 'TokenExpiredError') {
        err = new UnauthorizedError('Token expired', 'TOKEN_EXPIRED');
    }
    else if (!isOperationalError(err)) {
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
