import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '../utils/logger';

export const validate = (schema: Schema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
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

      logger.warn('Validation error:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    if (source === 'body') {
      req.body = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.query = value;
    }
    next();
  };
};

export const validateParams = (schema: Schema) => {
  return validate(schema, 'params');
};

export const validateQuery = (schema: Schema) => {
  return validate(schema, 'query');
};

