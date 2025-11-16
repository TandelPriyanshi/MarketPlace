"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = __importDefault(require("../services/product.service"));
const logger_1 = require("../utils/logger");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const { page, limit, status, sellerId, search } = req.query;
            const result = await product_service_1.default.getAllProducts({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
                sellerId: sellerId,
                search: search,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAllProducts controller:', error);
            next(error);
        }
    }
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_1.default.getProductById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            res.json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getProductById controller:', error);
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const sellerId = req.user.id; // Get seller ID from authenticated user
            const productData = { ...req.body, sellerId };
            const product = await product_service_1.default.createProduct(productData);
            res.status(201).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createProduct:', error);
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const sellerId = req.user.id; // Get seller ID from authenticated user
            const product = await product_service_1.default.updateProduct(id, req.body);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found or you do not have permission to update it'
                });
            }
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateProduct:', error);
            next(error);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const sellerId = req.user.id; // Get seller ID from authenticated user
            const deleted = await product_service_1.default.deleteProduct(id, sellerId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found or you do not have permission to delete it'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteProduct:', error);
            next(error);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
