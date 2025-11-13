"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrorDB = exports.handleDuplicateFieldsDB = exports.handleCastErrorDB = exports.handleJWTExpiredError = exports.handleJWTError = exports.notFoundHandler = exports.setServerInstance = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(message, statusCode = 500, errors, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Default to 500 if status code is not set
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log the error
    logger_1.logger.error({
        message: err.message,
        status: err.statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {},
        errors: err.errors,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user?.id || 'anonymous',
    });
    // In development, send the full error stack trace
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            errors: err.errors,
            stack: err.stack,
        });
    }
    // In production, don't leak error details
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            errors: err.errors,
        });
    }
    // For unknown errors, send a generic message
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong!',
    });
};
exports.errorHandler = errorHandler;
// Store server instance for error handling
let server;
const setServerInstance = (srv) => {
    server = srv;
};
exports.setServerInstance = setServerInstance;
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION! Shutting down...');
    logger_1.logger.error(err.name, err.message);
    if (server) {
        // Close server & exit process
        server.close(() => {
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger_1.logger.error(err.name, err.message);
    // Close server & exit process
    process.exit(1);
});
// Handle 404 Not Found
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Can't find ${req.originalUrl} on this server!`,
    });
};
exports.notFoundHandler = notFoundHandler;
// Handle JWT errors
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
exports.handleJWTError = handleJWTError;
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);
exports.handleJWTExpiredError = handleJWTExpiredError;
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
exports.handleCastErrorDB = handleCastErrorDB;
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
exports.handleValidationErrorDB = handleValidationErrorDB;
