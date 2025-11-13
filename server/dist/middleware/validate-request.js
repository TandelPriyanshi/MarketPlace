"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        logger_1.logger.warn('Validation failed', {
            path: req.path,
            method: req.method,
            errors: errors.array()
        });
        // Format validation errors
        const formattedErrors = errors.array().map((error) => ({
            param: error.param,
            message: error.msg,
            value: error.value,
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
        });
    }
    next();
};
exports.validateRequest = validateRequest;
