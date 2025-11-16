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
    async getAssignedDeliveries(req, res) {
        try {
            const { status, page = 1, limit = 10, startDate, endDate } = req.query;
            const deliveryPersonId = req.user.id;
            // For now, reuse the getAssignedOrders logic
            // TODO: Implement proper pagination and date filtering in the service
            const orders = await delivery_service_1.default.getAssignedOrders(deliveryPersonId, status);
            // Transform orders to delivery format expected by client
            const deliveries = orders.map((order) => ({
                id: order.id,
                orderId: order.id,
                customerName: order.customer?.name || 'Unknown Customer',
                customerAddress: order.deliveryAddress || 'No Address',
                customerPhone: order.customer?.phone || 'No Phone',
                deliveryPersonId: order.deliveryPersonId,
                deliveryPersonName: order.deliveryPerson?.name || 'Not Assigned',
                status: order.status === 'out_for_delivery' ? 'in_transit' :
                    order.status === 'delivered' ? 'delivered' :
                        order.status === 'picked_up' ? 'picked_up' :
                            'assigned',
                assignedAt: order.createdAt,
                pickedUpAt: order.pickedUpAt,
                deliveredAt: order.deliveredAt,
                notes: order.notes,
                proofOfDelivery: order.proofOfDelivery,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                route: order.route,
                distance: order.distance,
            }));
            res.json({
                success: true,
                data: {
                    deliveries,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: deliveries.length,
                        totalPages: Math.ceil(deliveries.length / Number(limit)),
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAssignedDeliveries:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch assigned deliveries',
            });
        }
    }
    async getDeliveryStats(req, res) {
        try {
            const deliveryPersonId = req.user.id;
            // Get all assigned orders
            const orders = await delivery_service_1.default.getAssignedOrders(deliveryPersonId);
            // Calculate statistics
            const totalDeliveries = orders.length;
            const completedDeliveries = orders.filter((order) => order.status === 'delivered').length;
            const failedDeliveries = orders.filter((order) => order.status === 'returned' || order.status === 'cancelled').length;
            // Calculate average delivery time (simplified)
            const completedOrders = orders.filter((order) => order.status === 'delivered' && order.deliveredAt);
            const averageDeliveryTime = completedOrders.length > 0
                ? completedOrders.reduce((acc, order) => {
                    if (order.deliveredAt && order.pickedUpAt) {
                        const time = new Date(order.deliveredAt).getTime() - new Date(order.pickedUpAt).getTime();
                        return acc + time;
                    }
                    return acc;
                }, 0) / completedOrders.length / (1000 * 60) // Convert to minutes
                : 0;
            // Calculate total distance (simplified)
            const totalDistance = orders.reduce((acc, order) => acc + (order.distance || 0), 0);
            res.json({
                success: true,
                data: {
                    totalDeliveries,
                    completedDeliveries,
                    failedDeliveries,
                    averageDeliveryTime: Math.round(averageDeliveryTime),
                    totalDistance: Math.round(totalDistance * 100) / 100,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getDeliveryStats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch delivery statistics',
            });
        }
    }
}
exports.default = new DeliveryController();
