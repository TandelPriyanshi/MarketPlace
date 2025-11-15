"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validate = void 0;
const logger_1 = require("../utils/logger");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            logger_1.logger.warn('Validation error:', errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }
        if (source === 'body') {
            req.body = value;
        }
        else if (source === 'params') {
            req.params = value;
        }
        else {
            req.query = value;
        }
        next();
    };
};
exports.validate = validate;
const validateParams = (schema) => {
    return (0, exports.validate)(schema, 'params');
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (0, exports.validate)(schema, 'query');
};
exports.validateQuery = validateQuery;
