"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderIdSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const order_model_1 = require("../models/order.model");
exports.createOrderSchema = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        productId: joi_1.default.string().uuid().required().messages({
            'string.guid': 'Invalid product ID format',
            'any.required': 'Product ID is required',
        }),
        quantity: joi_1.default.number().integer().min(1).required().messages({
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
        }),
        price: joi_1.default.number().positive().precision(2).required().messages({
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required',
        }),
    }))
        .min(1)
        .required()
        .messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required',
    }),
    shippingAddress: joi_1.default.string().min(10).max(500).required().messages({
        'string.min': 'Shipping address must be at least 10 characters long',
        'string.max': 'Shipping address must not exceed 500 characters',
        'any.required': 'Shipping address is required',
    }),
    billingAddress: joi_1.default.string().min(10).max(500).optional(),
    metadata: joi_1.default.object().optional(),
});
exports.updateOrderStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid(...Object.values(order_model_1.OrderStatus))
        .required()
        .messages({
        'any.only': 'Invalid order status',
        'any.required': 'Status is required',
    }),
    reason: joi_1.default.string().max(500).optional(),
});
exports.orderIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid order ID format',
        'any.required': 'Order ID is required',
    }),
});
