import Joi from 'joi';
import { SellerStatus } from '../models/seller.model';

export const createSellerSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  businessName: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Business name must be at least 2 characters long',
    'string.max': 'Business name must not exceed 200 characters',
    'any.required': 'Business name is required',
  }),
  businessDescription: Joi.string().max(1000).optional(),
  businessAddress: Joi.string().max(500).optional(),
  businessPhone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  businessEmail: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  taxId: Joi.string().max(50).optional(),
});

export const updateSellerSchema = Joi.object({
  businessName: Joi.string().min(2).max(200).optional(),
  businessDescription: Joi.string().max(1000).optional(),
  businessAddress: Joi.string().max(500).optional(),
  businessPhone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
  businessEmail: Joi.string().email().optional(),
  taxId: Joi.string().max(50).optional(),
  status: Joi.string().valid(...Object.values(SellerStatus)).optional(),
});

export const sellerIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid seller ID format',
    'any.required': 'Seller ID is required',
  }),
});

