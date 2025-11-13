"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const db_1 = require("../db");
const logger_1 = require("../utils/logger");
class SellerService {
    // Product Management
    async getSellerProducts(sellerId, { page = 1, limit = 10, status }) {
        try {
            const where = { sellerId };
            if (status) {
                where.status = status;
            }
            const { count, rows } = await product_model_1.Product.findAndCountAll({
                where,
                limit,
                offset: (page - 1) * limit,
                order: [['createdAt', 'DESC']],
            });
            return {
                products: rows,
                pagination: {
                    total: count,
                    page,
                    totalPages: Math.ceil(count / limit),
                    limit,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching seller products:', error);
            throw error;
        }
    }
    async createProduct(sellerId, productData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const product = await product_model_1.Product.create({
                ...productData,
                sellerId,
                status: product_model_1.ProductStatus.DRAFT,
            }, { transaction });
            await transaction.commit();
            return product;
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error creating product:', error);
            throw error;
        }
    }
    async updateProduct(sellerId, productId, productData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const [updated] = await product_model_1.Product.update(productData, {
                where: { id: productId, sellerId },
                returning: true,
                transaction,
            });
            if (!updated) {
                throw new Error('Product not found or not owned by seller');
            }
            await transaction.commit();
            return await product_model_1.Product.findByPk(productId);
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error updating product:', error);
            throw error;
        }
    }
    async deleteProduct(sellerId, productId) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const deleted = await product_model_1.Product.destroy({
                where: { id: productId, sellerId },
                transaction,
            });
            if (!deleted) {
                throw new Error('Product not found or not owned by seller');
            }
            await transaction.commit();
            return { success: true };
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error deleting product:', error);
            throw error;
        }
    }
    // Order Management
    async getSellerOrders(sellerId, { page = 1, limit = 10, status }) {
        try {
            const where = { sellerId };
            if (status) {
                where.status = status;
            }
            const { count, rows } = await order_model_1.OrderItem.findAndCountAll({
                where,
                include: [
                    {
                        model: order_model_1.Order,
                        as: 'order',
                        include: [{ model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] }],
                    },
                    {
                        model: product_model_1.Product,
                        as: 'product',
                        attributes: ['id', 'name', 'images'],
                    },
                ],
                limit,
                offset: (page - 1) * limit,
                order: [['createdAt', 'DESC']],
            });
            return {
                orders: rows,
                pagination: {
                    total: count,
                    page,
                    totalPages: Math.ceil(count / limit),
                    limit,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching seller orders:', error);
            throw error;
        }
    }
    async updateOrderStatus(sellerId, orderItemId, status, reason) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const orderItem = await order_model_1.OrderItem.findOne({
                where: { id: orderItemId, sellerId },
                include: [{ model: order_model_1.Order, as: 'order' }],
                transaction,
            });
            if (!orderItem) {
                throw new Error('Order item not found or not owned by seller');
            }
            // Validate status transition
            this.validateStatusTransition(orderItem.status, status);
            // Update order item status
            await orderItem.update({ status, ...(reason && { cancellationReason: reason }) }, { transaction });
            // Check if all items in the order have the same status
            const orderItems = await order_model_1.OrderItem.findAll({
                where: { orderId: orderItem.orderId },
                transaction,
            });
            const allItemsHaveSameStatus = orderItems.every(item => item.status === status);
            if (allItemsHaveSameStatus && orderItem.order) {
                await orderItem.order.update({ status }, { transaction });
            }
            await transaction.commit();
            return await order_model_1.OrderItem.findByPk(orderItemId, {
                include: [
                    { model: order_model_1.Order, as: 'order' },
                    { model: product_model_1.Product, as: 'product' },
                ],
            });
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error updating order status:', error);
            throw error;
        }
    }
    // Dashboard
    async getSellerDashboard(sellerId) {
        try {
            const [totalProducts, totalOrders, totalRevenueResult] = await Promise.all([
                product_model_1.Product.count({ where: { sellerId } }),
                order_model_1.OrderItem.count({ where: { sellerId } }),
                // Get total revenue using a raw query for better type safety
                (async () => {
                    const result = await db_1.sequelize.query(`SELECT COALESCE(SUM(oi.price), 0) as total 
             FROM order_items oi 
             INNER JOIN orders o ON oi.orderId = o.id 
             WHERE oi.sellerId = :sellerId 
             AND oi.status = :status 
             AND o.paymentStatus = :paymentStatus`, {
                        replacements: {
                            sellerId,
                            status: order_model_1.OrderStatus.DELIVERED,
                            paymentStatus: order_model_1.PaymentStatus.PAID
                        },
                        type: sequelize_1.QueryTypes.SELECT
                    });
                    return { total: result[0]?.total ? parseFloat(result[0].total) : 0 };
                })()
            ]);
            const totalRevenue = typeof totalRevenueResult === 'object' && totalRevenueResult !== null
                ? totalRevenueResult.total
                : 0;
            const recentOrders = await order_model_1.OrderItem.findAll({
                where: { sellerId },
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: order_model_1.Order, as: 'order', include: [{ model: user_model_1.User, as: 'user' }] },
                    { model: product_model_1.Product, as: 'product' },
                ],
            });
            const productStatus = await product_model_1.Product.findAll({
                attributes: [
                    'status',
                    [db_1.sequelize.fn('COUNT', db_1.sequelize.col('id')), 'count'],
                ],
                where: { sellerId },
                group: ['status'],
                raw: true,
            });
            return {
                stats: {
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    productStatus,
                },
                recentOrders,
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching seller dashboard:', error);
            throw error;
        }
    }
    // Helper Methods
    validateStatusTransition(currentStatus, newStatus) {
        const allowedTransitions = {
            [order_model_1.OrderStatus.PENDING]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.PROCESSING]: [order_model_1.OrderStatus.SHIPPED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.SHIPPED]: [order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.DELIVERED]: [order_model_1.OrderStatus.COMPLETED],
            [order_model_1.OrderStatus.COMPLETED]: [],
            [order_model_1.OrderStatus.CANCELLED]: [],
            [order_model_1.OrderStatus.REFUNDED]: []
        };
        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
}
exports.default = new SellerService();
