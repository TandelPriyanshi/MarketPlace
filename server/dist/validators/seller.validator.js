"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerIdSchema = exports.updateSellerSchema = exports.createSellerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const seller_model_1 = require("../models/seller.model");
exports.createSellerSchema = joi_1.default.object({
    userId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid user ID format',
        'any.required': 'User ID is required',
    }),
    businessName: joi_1.default.string().min(2).max(200).required().messages({
        'string.min': 'Business name must be at least 2 characters long',
        'string.max': 'Business name must not exceed 200 characters',
        'any.required': 'Business name is required',
    }),
    businessDescription: joi_1.default.string().max(1000).optional(),
    businessAddress: joi_1.default.string().max(500).optional(),
    businessPhone: joi_1.default.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional().messages({
        'string.pattern.base': 'Please provide a valid phone number',
    }),
    businessEmail: joi_1.default.string().email().optional().messages({
        'string.email': 'Please provide a valid email address',
    }),
    taxId: joi_1.default.string().max(50).optional(),
});
exports.updateSellerSchema = joi_1.default.object({
    businessName: joi_1.default.string().min(2).max(200).optional(),
    businessDescription: joi_1.default.string().max(1000).optional(),
    businessAddress: joi_1.default.string().max(500).optional(),
    businessPhone: joi_1.default.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
    businessEmail: joi_1.default.string().email().optional(),
    taxId: joi_1.default.string().max(50).optional(),
    status: joi_1.default.string().valid(...Object.values(seller_model_1.SellerStatus)).optional(),
});
exports.sellerIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid seller ID format',
        'any.required': 'Seller ID is required',
    }),
});
