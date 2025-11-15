"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintIdSchema = exports.createComplaintSchema = exports.sellerFilterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sellerFilterSchema = joi_1.default.object({
    city: joi_1.default.string().max(100).optional(),
    area: joi_1.default.string().max(100).optional(),
    pincode: joi_1.default.string().pattern(/^[0-9]{6}$/).optional().messages({
        'string.pattern.base': 'Pincode must be 6 digits',
    }),
});
exports.createComplaintSchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().optional().messages({
        'string.guid': 'Invalid order ID format',
    }),
    type: joi_1.default.string()
        .valid('order_issue', 'delivery_issue', 'product_quality', 'seller_behavior', 'payment_issue', 'other')
        .required()
        .messages({
        'any.only': 'Invalid complaint type',
        'any.required': 'Complaint type is required',
    }),
    title: joi_1.default.string().min(5).max(200).required().messages({
        'string.min': 'Title must be at least 5 characters long',
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required',
    }),
    description: joi_1.default.string().min(10).max(2000).required().messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description must not exceed 2000 characters',
        'any.required': 'Description is required',
    }),
    attachments: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
});
exports.complaintIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid complaint ID format',
        'any.required': 'Complaint ID is required',
    }),
});
