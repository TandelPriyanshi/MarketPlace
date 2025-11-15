"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderIdSchema = exports.updateDeliveryStatusSchema = exports.assignDeliverySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const order_model_1 = require("../models/order.model");
exports.assignDeliverySchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid order ID format',
        'any.required': 'Order ID is required',
    }),
    deliveryPersonId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid delivery person ID format',
        'any.required': 'Delivery person ID is required',
    }),
});
exports.updateDeliveryStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid(...Object.values(order_model_1.DeliveryStatus))
        .required()
        .messages({
        'any.only': 'Invalid delivery status',
        'any.required': 'Status is required',
    }),
    notes: joi_1.default.string().max(1000).optional(),
    proofFiles: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
});
exports.orderIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid order ID format',
        'any.required': 'Order ID is required',
    }),
});
