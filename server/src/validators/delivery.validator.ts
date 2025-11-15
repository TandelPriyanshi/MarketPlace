import Joi from 'joi';
import { DeliveryStatus } from '../models/order.model';

export const assignDeliverySchema = Joi.object({
  orderId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid order ID format',
    'any.required': 'Order ID is required',
  }),
  deliveryPersonId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid delivery person ID format',
    'any.required': 'Delivery person ID is required',
  }),
});

export const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(DeliveryStatus))
    .required()
    .messages({
      'any.only': 'Invalid delivery status',
      'any.required': 'Status is required',
    }),
  notes: Joi.string().max(1000).optional(),
  proofFiles: Joi.array().items(Joi.string().uri()).optional(),
});

export const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid order ID format',
    'any.required': 'Order ID is required',
  }),
});

