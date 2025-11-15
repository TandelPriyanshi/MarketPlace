import Joi from 'joi';
import { OrderStatus } from '../models/order.model';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required().messages({
          'string.guid': 'Invalid product ID format',
          'any.required': 'Product ID is required',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity is required',
        }),
        price: Joi.number().positive().precision(2).required().messages({
          'number.positive': 'Price must be a positive number',
          'any.required': 'Price is required',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required',
    }),
  shippingAddress: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Shipping address must be at least 10 characters long',
    'string.max': 'Shipping address must not exceed 500 characters',
    'any.required': 'Shipping address is required',
  }),
  billingAddress: Joi.string().min(10).max(500).optional(),
  metadata: Joi.object().optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Status is required',
    }),
  reason: Joi.string().max(500).optional(),
});

export const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid order ID format',
    'any.required': 'Order ID is required',
  }),
});

