"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const delivery_service_1 = __importDefault(require("../services/delivery.service"));
const logger_1 = require("../utils/logger");
class DeliveryController {
    async getAssignedOrders(req, res) {
        try {
            const { status } = req.query;
            const deliveryPersonId = req.user.id;
            const orders = await delivery_service_1.default.getAssignedOrders(deliveryPersonId, status);
            res.json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAssignedOrders:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assigned orders',
            });
        }
    }
    async updateDeliveryStatus(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { id } = req.params;
            const { status, notes } = req.body;
            const deliveryPersonId = req.user.id;
            const order = await delivery_service_1.default.updateDeliveryStatus(id, deliveryPersonId, status, notes);
            res.json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateDeliveryStatus:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update delivery status',
            });
        }
    }
    async uploadDeliveryProof(req, res) {
        try {
            const { id } = req.params;
            const { type, notes } = req.body;
            const deliveryPersonId = req.user.id;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }
            const attachment = await delivery_service_1.default.uploadDeliveryProof(id, deliveryPersonId, req.file, type, notes);
            res.json({
                success: true,
                data: attachment,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in uploadDeliveryProof:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload delivery proof',
            });
        }
    }
    async getTodaysRoute(req, res) {
        try {
            const deliveryPersonId = req.user.id;
            const orders = await delivery_service_1.default.getTodaysRoute(deliveryPersonId);
            res.json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getTodaysRoute:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch today\'s route',
            });
        }
    }
}
exports.default = new DeliveryController();
