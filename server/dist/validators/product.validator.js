"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const product_model_1 = require("../models/product.model");
exports.createProductSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(200).required().messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name must not exceed 200 characters',
        'any.required': 'Product name is required',
    }),
    sku: joi_1.default.string().max(100).optional(),
    description: joi_1.default.string().max(5000).optional(),
    price: joi_1.default.number().positive().precision(2).required().messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required',
    }),
    stock: joi_1.default.number().integer().min(0).required().messages({
        'number.min': 'Stock must be 0 or greater',
        'any.required': 'Stock is required',
    }),
    images: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
    status: joi_1.default.string().valid(...Object.values(product_model_1.ProductStatus)).optional(),
    metadata: joi_1.default.object().optional(),
});
exports.updateProductSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(200).optional(),
    sku: joi_1.default.string().max(100).optional(),
    description: joi_1.default.string().max(5000).optional(),
    price: joi_1.default.number().positive().precision(2).optional(),
    stock: joi_1.default.number().integer().min(0).optional(),
    images: joi_1.default.array().items(joi_1.default.string().uri()).optional(),
    status: joi_1.default.string().valid(...Object.values(product_model_1.ProductStatus)).optional(),
    metadata: joi_1.default.object().optional(),
});
exports.productIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid product ID format',
        'any.required': 'Product ID is required',
    }),
});
