"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerController = exports.SellerController = void 0;
const seller_service_1 = __importDefault(require("../services/seller.service"));
const logger_1 = require("../utils/logger");
class SellerController {
    async getProducts(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { page, limit, status } = req.query;
            const result = await seller_service_1.default.getSellerProducts(sellerId, {
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
            logger_1.logger.error('Error in getProducts controller:', error);
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const sellerId = req.user.id;
            const product = await seller_service_1.default.createProduct(sellerId, req.body);
            res.status(201).json({
                success: true,
                data: product,
                message: 'Product created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createProduct controller:', error);
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { id } = req.params;
            const product = await seller_service_1.default.updateProduct(sellerId, id, req.body);
            res.json({
                success: true,
                data: product,
                message: 'Product updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateProduct controller:', error);
            next(error);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { id } = req.params;
            await seller_service_1.default.deleteProduct(sellerId, id);
            res.json({
                success: true,
                message: 'Product deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteProduct controller:', error);
            next(error);
        }
    }
    async getOrders(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { page, limit, status } = req.query;
            const result = await seller_service_1.default.getSellerOrders(sellerId, {
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
            logger_1.logger.error('Error in getOrders controller:', error);
            next(error);
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const sellerId = req.user.id;
            const { id } = req.params;
            const { status, reason } = req.body;
            const orderItem = await seller_service_1.default.updateOrderStatus(sellerId, id, status, reason);
            res.json({
                success: true,
                data: orderItem,
                message: 'Order status updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateOrderStatus controller:', error);
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const sellerId = req.user.id;
            const dashboard = await seller_service_1.default.getSellerDashboard(sellerId);
            res.json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getDashboard controller:', error);
            next(error);
        }
    }
}
exports.SellerController = SellerController;
exports.sellerController = new SellerController();
