"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const db_1 = require("../db");
const errors_1 = require("../utils/errors");
const validTransitions = {
    [order_model_1.OrderStatus.PENDING]: [order_model_1.OrderStatus.CONFIRMED, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.PROCESSING]: [order_model_1.OrderStatus.SHIPPED, order_model_1.OrderStatus.CANCELLED],
    [order_model_1.OrderStatus.SHIPPED]: [order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.RETURN_REQUESTED],
    [order_model_1.OrderStatus.DELIVERED]: [order_model_1.OrderStatus.RETURN_REQUESTED, order_model_1.OrderStatus.COMPLETED],
    [order_model_1.OrderStatus.RETURN_REQUESTED]: [order_model_1.OrderStatus.RETURN_APPROVED, order_model_1.OrderStatus.RETURN_REJECTED],
    [order_model_1.OrderStatus.RETURN_APPROVED]: [order_model_1.OrderStatus.RETURN_COMPLETED],
    [order_model_1.OrderStatus.RETURN_REJECTED]: [],
    [order_model_1.OrderStatus.RETURN_COMPLETED]: [],
    [order_model_1.OrderStatus.CANCELLED]: [],
    [order_model_1.OrderStatus.COMPLETED]: [],
    [order_model_1.OrderStatus.REFUNDED]: []
};
class OrderService {
    constructor() {
        /**
         * Update order status with validation
         */
        this.validTransitions = {
            [order_model_1.OrderStatus.PENDING]: [order_model_1.OrderStatus.CONFIRMED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.PROCESSING]: [order_model_1.OrderStatus.SHIPPED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.SHIPPED]: [order_model_1.OrderStatus.DELIVERED, order_model_1.OrderStatus.RETURN_REQUESTED],
            [order_model_1.OrderStatus.DELIVERED]: [order_model_1.OrderStatus.RETURN_REQUESTED, order_model_1.OrderStatus.COMPLETED],
            [order_model_1.OrderStatus.RETURN_REQUESTED]: [order_model_1.OrderStatus.RETURN_APPROVED, order_model_1.OrderStatus.RETURN_REJECTED],
            [order_model_1.OrderStatus.RETURN_APPROVED]: [order_model_1.OrderStatus.RETURN_COMPLETED, order_model_1.OrderStatus.REFUNDED],
            [order_model_1.OrderStatus.RETURN_COMPLETED]: [],
            [order_model_1.OrderStatus.RETURN_REJECTED]: [],
            [order_model_1.OrderStatus.REFUNDED]: [],
            [order_model_1.OrderStatus.CANCELLED]: [],
            [order_model_1.OrderStatus.COMPLETED]: []
        };
    }
    /**
     * Create a new order with transaction
     */
    async createOrder(userId, orderData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Validate order items
            if (!orderData.items || orderData.items.length === 0) {
                throw new errors_1.ValidationError('Order must contain at least one item');
            }
            // Get product details and validate stock
            const productIds = orderData.items.map(item => item.productId);
            const products = await product_model_1.Product.findAll({
                where: { id: { [sequelize_1.Op.in]: productIds } },
                transaction
            });
            // Check if all products exist
            if (products.length !== orderData.items.length) {
                const foundIds = products.map(p => p.id);
                const missingIds = orderData.items
                    .filter(item => !foundIds.includes(item.productId))
                    .map(item => item.productId);
                throw new errors_1.NotFoundError(`Products not found: ${missingIds.join(', ')}`);
            }
            // Calculate total and validate stock
            let subtotal = 0;
            const orderItems = [];
            const stockUpdates = [];
            for (const item of orderData.items) {
                const product = products.find(p => p.id === item.productId);
                if (!product)
                    continue;
                // Validate stock
                if (product.stock < item.quantity) {
                    throw new errors_1.ValidationError(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
                }
                // Calculate item total
                const itemTotal = item.quantity * item.price;
                subtotal += itemTotal;
                // Prepare order item
                orderItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: item.price,
                    total: itemTotal,
                    name: product.name,
                    image: product.images?.[0] || null
                });
                // Prepare stock update
                stockUpdates.push(product.decrement('stock', {
                    by: item.quantity,
                    transaction
                }));
            }
            // Calculate tax and total (example: 10% tax)
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            // Create the order
            const order = await order_model_1.Order.create({
                userId,
                status: order_model_1.OrderStatus.PENDING,
                paymentStatus: order_model_1.PaymentStatus.PENDING,
                subtotal,
                tax,
                total,
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod,
                items: orderItems
            }, {
                include: [{ model: orderItem_model_1.OrderItem, as: 'items' }],
                transaction
            });
            // Update product stock
            await Promise.all(stockUpdates);
            // Update product sales count
            for (const item of orderData.items) {
                await product_model_1.Product.increment('soldCount', {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction
                });
            }
            await transaction.commit();
            return order.reload({
                include: [
                    { model: orderItem_model_1.OrderItem, as: 'items' },
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] }
                ]
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.NotFoundError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to create order', error);
            }
            throw new errors_1.DatabaseError('Failed to create order', new Error('Unknown error occurred'));
        }
    }
    /**
     * Get order by ID with validation
     */
    async getOrderById(orderId, userId) {
        const where = { id: orderId };
        if (userId)
            where.userId = userId;
        const order = await order_model_1.Order.findOne({
            where,
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                {
                    model: user_model_1.User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone']
                }
            ]
        });
        if (!order) {
            throw new errors_1.NotFoundError('Order not found');
        }
        return order;
    }
    /**
     * List orders with pagination and filters
     */
    async listOrders({ page = 1, limit = 10, userId, sellerId, status, paymentStatus, startDate, endDate }) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (status)
            where.status = status;
        if (paymentStatus)
            where.paymentStatus = paymentStatus;
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate)
                where.created_at[sequelize_1.Op.gte] = startDate;
            if (endDate)
                where.created_at[sequelize_1.Op.lte] = endDate;
        }
        // If sellerId is provided, only return orders containing seller's products
        let include = [
            { model: orderItem_model_1.OrderItem, as: 'items' },
            { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] }
        ];
        if (sellerId) {
            include[0] = {
                model: orderItem_model_1.OrderItem,
                as: 'items',
                include: [{
                        model: product_model_1.Product,
                        where: { sellerId },
                        required: true
                    }]
            };
        }
        const { count, rows } = await order_model_1.Order.findAndCountAll({
            where,
            include,
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
            distinct: true
        });
        return {
            orders: rows,
            total: count
        };
    }
    async handleOrderCancellation(order) {
        // TODO: Implement order cancellation logic
        // - Restore product stock
        // - Send cancellation email
        // - Process refund if payment was made
        console.log(`Handling cancellation for order ${order.id}`);
    }
    async handleOrderDelivery(order) {
        // TODO: Implement order delivery logic
        // - Update inventory
        // - Send delivery confirmation
        // - Update seller metrics
        console.log(`Handling delivery for order ${order.id}`);
    }
    async handleReturnApproval(order) {
        // TODO: Implement return approval logic
        // - Process return
        // - Initiate refund if applicable
        // - Update inventory
        console.log(`Handling return approval for order ${order.id}`);
    }
    /**
     * Update payment status with validation
     */
    async updatePaymentStatus(orderId, paymentStatus, paymentId, paymentDetails) {
        const order = await this.getOrderById(orderId);
        // Check if payment status transition is valid
        const paymentStatusTransitions = {
            [order_model_1.PaymentStatus.PENDING]: [order_model_1.PaymentStatus.PROCESSING, order_model_1.PaymentStatus.COMPLETED, order_model_1.PaymentStatus.FAILED],
            [order_model_1.PaymentStatus.PROCESSING]: [order_model_1.PaymentStatus.COMPLETED, order_model_1.PaymentStatus.FAILED],
            [order_model_1.PaymentStatus.COMPLETED]: [order_model_1.PaymentStatus.REFUNDED, order_model_1.PaymentStatus.PARTIALLY_REFUNDED],
            [order_model_1.PaymentStatus.PAID]: [order_model_1.PaymentStatus.REFUNDED, order_model_1.PaymentStatus.PARTIALLY_REFUNDED],
            [order_model_1.PaymentStatus.FAILED]: [order_model_1.PaymentStatus.PENDING, order_model_1.PaymentStatus.PROCESSING],
            [order_model_1.PaymentStatus.REFUNDED]: [],
            [order_model_1.PaymentStatus.PARTIALLY_REFUNDED]: []
        };
        const allowedPaymentStatuses = paymentStatusTransitions[order.paymentStatus] || [];
        if (!allowedPaymentStatuses.includes(paymentStatus)) {
            throw new errors_1.ValidationError(`Invalid payment status transition from ${order.paymentStatus} to ${paymentStatus}`);
        }
        // Prepare update data
        const updateData = { paymentStatus };
        if (paymentId)
            updateData.paymentId = paymentId;
        if (paymentDetails)
            updateData.paymentDetails = paymentDetails;
        // Update order
        await order.update(updateData);
        // If payment is completed, update order status to confirmed
        if (paymentStatus === order_model_1.PaymentStatus.COMPLETED && order.status === order_model_1.OrderStatus.PENDING) {
            await order.update({ status: order_model_1.OrderStatus.CONFIRMED });
        }
        return order.reload({
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    }
    // ...
    /**
     * Get user orders with pagination
     */
    async getUserOrders(userId, options) {
        const { page = 1, limit = 10, status } = options;
        const where = { userId };
        if (status)
            where.status = status;
        const { count, rows } = await order_model_1.Order.findAndCountAll({
            where,
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
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
    /**
     * Cancel an order
     */
    async cancelOrder(userId, orderId, reason) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const order = await this.getOrderById(orderId, userId);
            if (order.status !== order_model_1.OrderStatus.PENDING && order.status !== order_model_1.OrderStatus.CONFIRMED) {
                throw new errors_1.ValidationError('Cannot cancel order in current status');
            }
            await order.update({
                status: order_model_1.OrderStatus.CANCELLED,
                isCancelled: true,
            }, { transaction });
            // Restore product stock
            if (order.items) {
                for (const item of order.items) {
                    await product_model_1.Product.increment('stock', {
                        by: item.quantity,
                        where: { id: item.productId },
                        transaction,
                    });
                }
            }
            await transaction.commit();
            return order.reload({
                include: [
                    { model: orderItem_model_1.OrderItem, as: 'items' },
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                ],
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.NotFoundError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to cancel order', error);
            }
            throw new errors_1.DatabaseError('Failed to cancel order', new Error('Unknown error occurred'));
        }
    }
    /**
     * Place a new order (alias for createOrder)
     */
    async placeOrder(customerId, orderData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Get product details and prices
            const productIds = orderData.items.map(item => item.productId);
            const products = await product_model_1.Product.findAll({
                where: { id: { [sequelize_1.Op.in]: productIds } },
                transaction,
            });
            if (products.length !== productIds.length) {
                throw new errors_1.ValidationError('Some products not found');
            }
            // Create items with prices
            const itemsWithPrices = orderData.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product)
                    throw new errors_1.ValidationError(`Product ${item.productId} not found`);
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.get('price'),
                };
            });
            // Convert to the format expected by createOrder
            const createOrderData = {
                items: itemsWithPrices,
                shippingAddress: JSON.stringify(orderData.shippingAddress),
                paymentMethod: orderData.paymentMethod,
            };
            const order = await this.createOrder(customerId, createOrderData);
            await transaction.commit();
            return order;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    /**
     * Update order status
     */
    async updateOrderStatus(userId, orderId, payload) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const order = await order_model_1.Order.findByPk(orderId, {
                include: [
                    { model: orderItem_model_1.OrderItem, as: 'items' },
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                ],
                transaction,
            });
            if (!order) {
                throw new errors_1.NotFoundError('Order not found');
            }
            // Verify user has permission to update this order
            if (payload.userRole === 'customer' && order.userId !== userId) {
                throw new errors_1.ForbiddenError('You can only update your own orders');
            }
            if (payload.userRole === 'seller' && order.sellerId !== userId) {
                throw new errors_1.ForbiddenError('You can only update orders for your products');
            }
            // Validate status transitions
            this.validateStatusTransition(order.status, payload.status);
            const updateData = { status: payload.status };
            if (payload.notes)
                updateData.notes = payload.notes;
            if (payload.trackingNumber)
                updateData.trackingNumber = payload.trackingNumber;
            if (payload.estimatedDelivery)
                updateData.estimatedDelivery = payload.estimatedDelivery;
            await order.update(updateData, { transaction });
            await transaction.commit();
            return order.reload();
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.NotFoundError || error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to update order status', error);
            }
            throw new errors_1.DatabaseError('Failed to update order status', new Error('Unknown error occurred'));
        }
    }
    /**
     * Get customer orders with pagination and filtering
     */
    async getCustomerOrders(userId, options) {
        const { page = 1, limit = 10, status, startDate, endDate, search } = options;
        const offset = (page - 1) * limit;
        const where = { userId };
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt[sequelize_1.Op.gte] = new Date(startDate);
            if (endDate)
                where.createdAt[sequelize_1.Op.lte] = new Date(endDate);
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { id: { [sequelize_1.Op.like]: `%${search}%` } },
                { trackingNumber: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const { count, rows } = await order_model_1.Order.findAndCountAll({
            where,
            include: [
                {
                    model: orderItem_model_1.OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: product_model_1.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku', 'images'],
                        },
                    ],
                },
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
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
    /**
     * Get seller orders with pagination and filtering
     */
    async getSellerOrders(sellerId, options) {
        const { page = 1, limit = 10, status, startDate, endDate, search } = options;
        const offset = (page - 1) * limit;
        const where = { sellerId };
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt[sequelize_1.Op.gte] = new Date(startDate);
            if (endDate)
                where.createdAt[sequelize_1.Op.lte] = new Date(endDate);
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { id: { [sequelize_1.Op.like]: `%${search}%` } },
                { trackingNumber: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const { count, rows } = await order_model_1.Order.findAndCountAll({
            where,
            include: [
                {
                    model: orderItem_model_1.OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: product_model_1.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku', 'images'],
                        },
                    ],
                },
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
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
    /**
     * Validate order status transitions
     */
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [order_model_1.OrderStatus.PENDING]: [order_model_1.OrderStatus.CONFIRMED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.CONFIRMED]: [order_model_1.OrderStatus.PROCESSING, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.PROCESSING]: [order_model_1.OrderStatus.SHIPPED, order_model_1.OrderStatus.CANCELLED],
            [order_model_1.OrderStatus.SHIPPED]: [order_model_1.OrderStatus.DELIVERED],
            [order_model_1.OrderStatus.DELIVERED]: [order_model_1.OrderStatus.COMPLETED, order_model_1.OrderStatus.RETURN_REQUESTED],
            [order_model_1.OrderStatus.COMPLETED]: [order_model_1.OrderStatus.RETURN_REQUESTED],
            [order_model_1.OrderStatus.CANCELLED]: [],
            [order_model_1.OrderStatus.REFUNDED]: [],
            [order_model_1.OrderStatus.RETURN_REQUESTED]: [order_model_1.OrderStatus.RETURN_APPROVED, order_model_1.OrderStatus.RETURN_REJECTED],
            [order_model_1.OrderStatus.RETURN_APPROVED]: [order_model_1.OrderStatus.RETURN_COMPLETED],
            [order_model_1.OrderStatus.RETURN_REJECTED]: [],
            [order_model_1.OrderStatus.RETURN_COMPLETED]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new errors_1.ValidationError(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
    /**
     * Get order statistics
     */
    async getOrderStats(userId, sellerId) {
        const where = {};
        if (userId)
            where.userId = userId;
        if (sellerId) {
            where['$items.product.sellerId$'] = sellerId;
        }
        const [totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders, totalRevenueResult, recentOrders] = await Promise.all([
            order_model_1.Order.count({
                where,
                ...(sellerId ? {
                    include: [{
                            model: orderItem_model_1.OrderItem,
                            as: 'items',
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        }],
                    distinct: true
                } : {})
            }),
            order_model_1.Order.count({
                where: {
                    ...where,
                    status: order_model_1.OrderStatus.PENDING
                },
                ...(sellerId ? {
                    include: [{
                            model: orderItem_model_1.OrderItem,
                            as: 'items',
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        }],
                    distinct: true
                } : {})
            }),
            order_model_1.Order.count({
                where: {
                    ...where,
                    status: order_model_1.OrderStatus.PROCESSING
                },
                ...(sellerId ? {
                    include: [{
                            model: orderItem_model_1.OrderItem,
                            as: 'items',
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        }],
                    distinct: true
                } : {})
            }),
            order_model_1.Order.count({
                where: {
                    ...where,
                    status: order_model_1.OrderStatus.COMPLETED
                },
                ...(sellerId ? {
                    include: [{
                            model: orderItem_model_1.OrderItem,
                            as: 'items',
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        }],
                    distinct: true
                } : {})
            }),
            order_model_1.Order.count({
                where: {
                    ...where,
                    status: order_model_1.OrderStatus.CANCELLED
                },
                ...(sellerId ? {
                    include: [{
                            model: orderItem_model_1.OrderItem,
                            as: 'items',
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        }],
                    distinct: true
                } : {})
            }),
            (async () => {
                const result = await order_model_1.Order.findOne({
                    attributes: [
                        [db_1.sequelize.fn('COALESCE', db_1.sequelize.fn('SUM', db_1.sequelize.col('total')), 0), 'totalRevenue']
                    ],
                    where: {
                        status: order_model_1.OrderStatus.COMPLETED,
                        paymentStatus: order_model_1.PaymentStatus.COMPLETED,
                        ...(sellerId ? { sellerId } : {})
                    },
                    raw: true
                });
                return { totalRevenue: result ? result.totalRevenue : 0 };
            })(),
            order_model_1.Order.findAll({
                where,
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: orderItem_model_1.OrderItem,
                        as: 'items',
                        ...(sellerId ? {
                            include: [{
                                    model: product_model_1.Product,
                                    where: { sellerId },
                                    required: true
                                }]
                        } : {})
                    },
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name'] }
                ]
            })
        ]);
        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: Number(totalRevenueResult),
            recentOrders
        };
    }
}
exports.default = new OrderService();
