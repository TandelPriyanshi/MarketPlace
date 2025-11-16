"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const order_service_1 = __importDefault(require("../services/order.service"));
const logger_1 = require("../utils/logger");
class OrderController {
    async getAllOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { page, limit, status, startDate, endDate, search } = req.query;
            let result;
            if (userRole === 'seller') {
                result = await order_service_1.default.getSellerOrders(userId, {
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 10,
                    status: status,
                    startDate: startDate,
                    endDate: endDate,
                    search: search,
                });
            }
            else {
                result = await order_service_1.default.getCustomerOrders(userId, {
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 10,
                    status: status,
                    startDate: startDate,
                    endDate: endDate,
                    search: search,
                });
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAllOrders controller:', error);
            next(error);
        }
    }
    async getOrderById(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const order = await order_service_1.default.getOrderById(userId, id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            res.json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getOrderById controller:', error);
            next(error);
        }
    }
    async placeOrder(req, res, next) {
        try {
            const customerId = req.user.id;
            const orderData = req.body;
            const order = await order_service_1.default.placeOrder(customerId, orderData);
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order placed successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in placeOrder controller:', error);
            next(error);
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { id } = req.params;
            const { status, notes, trackingNumber, estimatedDelivery } = req.body;
            const order = await order_service_1.default.updateOrderStatus(userId, id, {
                status,
                notes,
                trackingNumber,
                estimatedDelivery,
                userRole,
            });
            res.json({
                success: true,
                data: order,
                message: 'Order status updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateOrderStatus controller:', error);
            next(error);
        }
    }
    async cancelOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { reason } = req.body;
            const order = await order_service_1.default.cancelOrder(userId, id, reason);
            res.json({
                success: true,
                data: order,
                message: 'Order cancelled successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in cancelOrder controller:', error);
            next(error);
        }
    }
    async getCustomerOrders(req, res, next) {
        try {
            const customerId = req.user.id;
            const { page, limit, status, startDate, endDate, search } = req.query;
            const result = await order_service_1.default.getCustomerOrders(customerId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
                startDate: startDate,
                endDate: endDate,
                search: search,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getCustomerOrders controller:', error);
            next(error);
        }
    }
    async getSellerOrders(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { page, limit, status, startDate, endDate, search } = req.query;
            const result = await order_service_1.default.getSellerOrders(sellerId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
                startDate: startDate,
                endDate: endDate,
                search: search,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getSellerOrders controller:', error);
            next(error);
        }
    }
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
