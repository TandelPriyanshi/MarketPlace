"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const logger_1 = require("../utils/logger");
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, req, res, next) => {
    try {
        const status = error.status || error.statusCode || 500;
        const message = error.message || 'Something went wrong';
        logger_1.logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
        if (process.env.NODE_ENV === 'development') {
            logger_1.logger.error(error.stack);
        }
        res.status(status).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.errorHandler = errorHandler;
