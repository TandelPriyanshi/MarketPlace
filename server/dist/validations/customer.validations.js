"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComplaintsValidation = exports.createComplaintValidation = exports.getOrderDetailsValidation = exports.placeOrderValidation = exports.getSellersValidation = void 0;
const express_validator_1 = require("express-validator");
const complaint_model_1 = require("../models/complaint.model");
exports.getSellersValidation = [
    (0, express_validator_1.query)('city').optional().isString().trim().escape(),
    (0, express_validator_1.query)('area').optional().isString().trim().escape(),
    (0, express_validator_1.query)('pincode').optional().isPostalCode('IN').withMessage('Invalid pincode format')
];
exports.placeOrderValidation = [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.productId').isUUID().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('shippingAddress').isObject().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('shippingAddress.street').isString().notEmpty().withMessage('Street is required'),
    (0, express_validator_1.body)('shippingAddress.city').isString().notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state').isString().notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.postalCode').isPostalCode('IN').withMessage('Invalid postal code'),
    (0, express_validator_1.body)('shippingAddress.phone').isMobilePhone('any').withMessage('Invalid phone number'),
    (0, express_validator_1.body)('billingAddress').optional().isObject(),
    (0, express_validator_1.body)('billingAddress.street').if((0, express_validator_1.body)('billingAddress').exists()).isString().notEmpty(),
    (0, express_validator_1.body)('billingAddress.city').if((0, express_validator_1.body)('billingAddress').exists()).isString().notEmpty(),
    (0, express_validator_1.body)('billingAddress.state').if((0, express_validator_1.body)('billingAddress').exists()).isString().notEmpty(),
    (0, express_validator_1.body)('billingAddress.postalCode').if((0, express_validator_1.body)('billingAddress').exists()).isPostalCode('IN'),
    (0, express_validator_1.body)('billingAddress.phone').if((0, express_validator_1.body)('billingAddress').exists()).isMobilePhone('any')
];
exports.getOrderDetailsValidation = [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid order ID')
];
exports.createComplaintValidation = [
    (0, express_validator_1.body)('orderId').optional().isUUID().withMessage('Invalid order ID'),
    (0, express_validator_1.body)('type').isIn(Object.values(complaint_model_1.ComplaintType)).withMessage('Invalid complaint type'),
    (0, express_validator_1.body)('title').isString().trim().isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    (0, express_validator_1.body)('description').isString().trim().isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters')
];
exports.getComplaintsValidation = [
    (0, express_validator_1.query)('status').optional().isIn(['open', 'in_progress', 'resolved', 'rejected', 'closed'])
        .withMessage('Invalid status value')
];
