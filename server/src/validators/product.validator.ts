import Joi from 'joi';
import { ProductStatus } from '../models/product.model';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Product name must be at least 2 characters long',
    'string.max': 'Product name must not exceed 200 characters',
    'any.required': 'Product name is required',
  }),
  sku: Joi.string().max(100).optional(),
  description: Joi.string().max(5000).optional(),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Stock must be 0 or greater',
    'any.required': 'Stock is required',
  }),
  images: Joi.array().items(Joi.string().uri()).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  metadata: Joi.object().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  sku: Joi.string().max(100).optional(),
  description: Joi.string().max(5000).optional(),
  price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  status: Joi.string().valid(...Object.values(ProductStatus)).optional(),
  metadata: Joi.object().optional(),
});

export const productIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid product ID format',
    'any.required': 'Product ID is required',
  }),
});

