import Joi from 'joi';
import { VisitStatus } from '../models/visit.model';
import { BeatStatus } from '../models/beat.model';

export const createBeatSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Beat name must be at least 2 characters long',
    'string.max': 'Beat name must not exceed 200 characters',
    'any.required': 'Beat name is required',
  }),
  description: Joi.string().max(1000).optional(),
  salesmanId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid salesman ID format',
    'any.required': 'Salesman ID is required',
  }),
  startDate: Joi.date().required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required',
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required',
  }),
  route: Joi.object({
    coordinates: Joi.array()
      .items(
        Joi.object({
          lat: Joi.number().min(-90).max(90).required(),
          lng: Joi.number().min(-180).max(180).required(),
        })
      )
      .optional(),
    waypoints: Joi.array()
      .items(
        Joi.object({
          storeId: Joi.string().uuid().required(),
          order: Joi.number().integer().min(0).required(),
        })
      )
      .optional(),
  }).optional(),
});

export const createVisitSchema = Joi.object({
  salesmanId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid salesman ID format',
    'any.required': 'Salesman ID is required',
  }),
  storeId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid store ID format',
    'any.required': 'Store ID is required',
  }),
  scheduledAt: Joi.date().required().messages({
    'date.base': 'Scheduled date must be a valid date',
    'any.required': 'Scheduled date is required',
  }),
  purpose: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Purpose must be at least 5 characters long',
    'string.max': 'Purpose must not exceed 500 characters',
    'any.required': 'Purpose is required',
  }),
  remarks: Joi.string().max(1000).optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).required(),
  }).optional(),
});

export const updateVisitStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(VisitStatus))
    .required()
    .messages({
      'any.only': 'Invalid visit status',
      'any.required': 'Status is required',
    }),
  checkIn: Joi.object({
    timestamp: Joi.date().required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().max(500).required(),
    }).required(),
    imageUrl: Joi.string().uri().optional(),
  }).optional(),
  checkOut: Joi.object({
    timestamp: Joi.date().required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().max(500).required(),
    }).required(),
    summary: Joi.string().max(1000).optional(),
  }).optional(),
});

export const visitIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid visit ID format',
    'any.required': 'Visit ID is required',
  }),
});

export const beatIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid beat ID format',
    'any.required': 'Beat ID is required',
  }),
});

