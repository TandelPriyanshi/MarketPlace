"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beatIdSchema = exports.visitIdSchema = exports.updateVisitStatusSchema = exports.createVisitSchema = exports.createBeatSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const visit_model_1 = require("../models/visit.model");
exports.createBeatSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(200).required().messages({
        'string.min': 'Beat name must be at least 2 characters long',
        'string.max': 'Beat name must not exceed 200 characters',
        'any.required': 'Beat name is required',
    }),
    description: joi_1.default.string().max(1000).optional(),
    salesmanId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid salesman ID format',
        'any.required': 'Salesman ID is required',
    }),
    startDate: joi_1.default.date().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required',
    }),
    endDate: joi_1.default.date().greater(joi_1.default.ref('startDate')).required().messages({
        'date.base': 'End date must be a valid date',
        'date.greater': 'End date must be after start date',
        'any.required': 'End date is required',
    }),
    route: joi_1.default.object({
        coordinates: joi_1.default.array()
            .items(joi_1.default.object({
            lat: joi_1.default.number().min(-90).max(90).required(),
            lng: joi_1.default.number().min(-180).max(180).required(),
        }))
            .optional(),
        waypoints: joi_1.default.array()
            .items(joi_1.default.object({
            storeId: joi_1.default.string().uuid().required(),
            order: joi_1.default.number().integer().min(0).required(),
        }))
            .optional(),
    }).optional(),
});
exports.createVisitSchema = joi_1.default.object({
    salesmanId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid salesman ID format',
        'any.required': 'Salesman ID is required',
    }),
    storeId: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid store ID format',
        'any.required': 'Store ID is required',
    }),
    scheduledAt: joi_1.default.date().required().messages({
        'date.base': 'Scheduled date must be a valid date',
        'any.required': 'Scheduled date is required',
    }),
    purpose: joi_1.default.string().min(5).max(500).required().messages({
        'string.min': 'Purpose must be at least 5 characters long',
        'string.max': 'Purpose must not exceed 500 characters',
        'any.required': 'Purpose is required',
    }),
    remarks: joi_1.default.string().max(1000).optional(),
    location: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required(),
        address: joi_1.default.string().max(500).required(),
    }).optional(),
});
exports.updateVisitStatusSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid(...Object.values(visit_model_1.VisitStatus))
        .required()
        .messages({
        'any.only': 'Invalid visit status',
        'any.required': 'Status is required',
    }),
    checkIn: joi_1.default.object({
        timestamp: joi_1.default.date().required(),
        location: joi_1.default.object({
            latitude: joi_1.default.number().min(-90).max(90).required(),
            longitude: joi_1.default.number().min(-180).max(180).required(),
            address: joi_1.default.string().max(500).required(),
        }).required(),
        imageUrl: joi_1.default.string().uri().optional(),
    }).optional(),
    checkOut: joi_1.default.object({
        timestamp: joi_1.default.date().required(),
        location: joi_1.default.object({
            latitude: joi_1.default.number().min(-90).max(90).required(),
            longitude: joi_1.default.number().min(-180).max(180).required(),
            address: joi_1.default.string().max(500).required(),
        }).required(),
        summary: joi_1.default.string().max(1000).optional(),
    }).optional(),
});
exports.visitIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid visit ID format',
        'any.required': 'Visit ID is required',
    }),
});
exports.beatIdSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Invalid beat ID format',
        'any.required': 'Beat ID is required',
    }),
});
