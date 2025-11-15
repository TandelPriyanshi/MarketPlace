import Joi from 'joi';
import { ComplaintStatus, ComplaintType } from '../models/complaint.model';

export const createComplaintSchema = Joi.object({
  orderId: Joi.string().uuid().optional().messages({
    'string.guid': 'Invalid order ID format',
  }),
  type: Joi.string()
    .valid(...Object.values(ComplaintType))
    .required()
    .messages({
      'any.only': 'Invalid complaint type',
      'any.required': 'Complaint type is required',
    }),
  title: Joi.string().min(5).max(200).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description must not exceed 2000 characters',
    'any.required': 'Description is required',
  }),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateComplaintStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ComplaintStatus))
    .required()
    .messages({
      'any.only': 'Invalid complaint status',
      'any.required': 'Status is required',
    }),
  resolutionNotes: Joi.string().max(2000).optional(),
});

export const complaintIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid complaint ID format',
    'any.required': 'Complaint ID is required',
  }),
});

