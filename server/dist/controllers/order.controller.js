"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const logger_1 = require("../utils/logger");
class OrderController {
    async getAllOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit, status } = req.query;
            const result = await order_service_1.orderService.getUserOrders(userId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
            });
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
            const order = await order_service_1.orderService.getOrderById(userId, id);
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
    async cancelOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { reason } = req.body;
            const order = await order_service_1.orderService.cancelOrder(userId, id, reason);
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
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
