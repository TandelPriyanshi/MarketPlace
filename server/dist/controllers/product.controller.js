"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const logger_1 = require("../utils/logger");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const { page, limit, status, sellerId, search } = req.query;
            const result = await product_service_1.productService.getAllProducts({
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
            const product = await product_service_1.productService.getProductById(id);
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
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
