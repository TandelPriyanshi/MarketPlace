import { body, query, param } from 'express-validator';
import { ComplaintType } from '../models/complaint.model';

export const getSellersValidation = [
  query('city').optional().isString().trim().escape(),
  query('area').optional().isString().trim().escape(),
  query('pincode').optional().isPostalCode('IN').withMessage('Invalid pincode format')
];

export const placeOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isUUID().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').isString().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').isString().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').isString().notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').isPostalCode('IN').withMessage('Invalid postal code'),
  body('shippingAddress.phone').isMobilePhone('any').withMessage('Invalid phone number'),
  body('billingAddress').optional().isObject(),
  body('billingAddress.street').if(body('billingAddress').exists()).isString().notEmpty(),
  body('billingAddress.city').if(body('billingAddress').exists()).isString().notEmpty(),
  body('billingAddress.state').if(body('billingAddress').exists()).isString().notEmpty(),
  body('billingAddress.postalCode').if(body('billingAddress').exists()).isPostalCode('IN'),
  body('billingAddress.phone').if(body('billingAddress').exists()).isMobilePhone('any')
];

export const getOrderDetailsValidation = [
  param('id').isUUID().withMessage('Invalid order ID')
];

export const createComplaintValidation = [
  body('orderId').optional().isUUID().withMessage('Invalid order ID'),
  body('type').isIn(Object.values(ComplaintType)).withMessage('Invalid complaint type'),
  body('title').isString().trim().isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
];

export const getComplaintsValidation = [
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'rejected', 'closed'])
    .withMessage('Invalid status value')
];
