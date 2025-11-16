"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const sequelize_1 = require("sequelize");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
class OrderRepository {
    async createOrder(orderData, items, transaction) {
        const order = await order_model_1.Order.create(orderData, { transaction });
        // Create order items
        const orderItems = items.map(item => ({
            ...item,
            orderId: order.id,
        }));
        await orderItem_model_1.OrderItem.bulkCreate(orderItems, { transaction });
        // We just created this order, so it should exist
        return (await this.findById(order.id, transaction));
    }
    async findById(id, transaction) {
        return order_model_1.Order.findByPk(id, {
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { association: 'user' },
                { association: 'seller' },
                { association: 'deliveryPerson' },
            ],
            transaction,
        });
    }
    async updateOrderStatus(id, status, transaction) {
        return order_model_1.Order.update({ status }, {
            where: { id },
            returning: true,
            transaction,
        });
    }
    async updatePaymentStatus(id, paymentStatus, transaction) {
        return order_model_1.Order.update({ paymentStatus }, {
            where: { id },
            returning: true,
            transaction,
        });
    }
    async updateDeliveryStatus(id, deliveryStatus, deliveryPersonId, transaction) {
        const updateData = { deliveryStatus };
        if (deliveryPersonId) {
            updateData.deliveryPersonId = deliveryPersonId;
        }
        return order_model_1.Order.update(updateData, {
            where: { id },
            returning: true,
            transaction,
        });
    }
    async findOrdersByUser(userId, page = 1, limit = 10, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return order_model_1.Order.findAndCountAll({
            where,
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { association: 'seller' },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
    }
    async findOrdersBySeller(sellerId, page = 1, limit = 10, status) {
        const where = { sellerId };
        if (status) {
            where.status = status;
        }
        return order_model_1.Order.findAndCountAll({
            where,
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { association: 'user' },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
    }
    async findAvailableDeliveryOrders(page = 1, limit = 10) {
        return order_model_1.Order.findAndCountAll({
            where: {
                deliveryStatus: order_model_1.DeliveryStatus.PENDING,
                status: {
                    [sequelize_1.Op.notIn]: [order_model_1.OrderStatus.CANCELLED, order_model_1.OrderStatus.REFUNDED]
                },
                deliveryPersonId: null
            },
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { association: 'user' },
                { association: 'seller' },
            ],
            order: [['created_at', 'ASC']],
            limit,
            offset: (page - 1) * limit,
        });
    }
    async findDeliveryPersonOrders(deliveryPersonId, page = 1, limit = 10, status) {
        const where = { deliveryPersonId };
        if (status) {
            where.deliveryStatus = status;
        }
        return order_model_1.Order.findAndCountAll({
            where,
            include: [
                { model: orderItem_model_1.OrderItem, as: 'items' },
                { association: 'user' },
                { association: 'seller' },
            ],
            order: [['updatedAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
    }
}
exports.OrderRepository = OrderRepository;
