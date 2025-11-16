"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const order_model_1 = require("../models/order.model");
const order_model_2 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
class DeliveryRepository {
    constructor() { }
    static getInstance() {
        if (!DeliveryRepository.instance) {
            DeliveryRepository.instance = new DeliveryRepository();
        }
        return DeliveryRepository.instance;
    }
    async create(deliveryData) {
        const delivery = await order_model_2.Order.update({
            deliveryStatus: deliveryData.status,
            deliveryPersonId: deliveryData.deliveryPersonId,
            estimatedDelivery: deliveryData.estimatedDelivery,
            notes: deliveryData.notes
        }, {
            where: { id: deliveryData.orderId },
            returning: true
        });
        return {
            ...delivery[1][0].get(),
            status: deliveryData.status,
            deliveryPersonId: deliveryData.deliveryPersonId,
            estimatedDelivery: deliveryData.estimatedDelivery,
            notes: deliveryData.notes || null
        };
    }
    async findById(id) {
        return await order_model_2.Order.findByPk(id, {
            include: [
                { model: user_model_1.User, as: 'deliveryPerson' },
                { model: user_model_1.User, as: 'user' }
            ]
        });
    }
    async findByDeliveryPerson(deliveryPersonId, status) {
        const where = { deliveryPersonId };
        if (status)
            where.deliveryStatus = status;
        return await order_model_2.Order.findAndCountAll({
            where,
            include: [
                { model: user_model_1.User, as: 'user' }
            ],
            order: [['created_at', 'DESC']]
        });
    }
    async updateStatus(orderId, status, deliveryPersonId) {
        const updateData = { deliveryStatus: status };
        if (status === order_model_1.DeliveryStatus.PICKED_UP) {
            updateData.pickupAt = new Date();
        }
        else if (status === order_model_1.DeliveryStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        if (deliveryPersonId) {
            updateData.deliveryPersonId = deliveryPersonId;
        }
        return await order_model_2.Order.update(updateData, {
            where: { id: orderId },
            returning: true
        });
    }
    async assignDeliveryPerson(orderId, deliveryPersonId) {
        return await order_model_2.Order.update({
            deliveryPersonId,
            deliveryStatus: order_model_1.DeliveryStatus.ASSIGNED
        }, {
            where: { id: orderId },
            returning: true
        });
    }
    async getDeliveryStats(deliveryPersonId) {
        const where = {};
        if (deliveryPersonId) {
            where.deliveryPersonId = deliveryPersonId;
        }
        const [total, pending, inProgress, delivered] = await Promise.all([
            order_model_2.Order.count({ where }),
            order_model_2.Order.count({ where: { ...where, deliveryStatus: order_model_1.DeliveryStatus.PENDING } }),
            order_model_2.Order.count({
                where: {
                    ...where,
                    deliveryStatus: {
                        [sequelize_1.Op.in]: [order_model_1.DeliveryStatus.ASSIGNED, order_model_1.DeliveryStatus.PICKED_UP, order_model_1.DeliveryStatus.OUT_FOR_DELIVERY]
                    }
                }
            }),
            order_model_2.Order.count({ where: { ...where, deliveryStatus: order_model_1.DeliveryStatus.DELIVERED } })
        ]);
        return { total, pending, inProgress, delivered };
    }
}
exports.default = DeliveryRepository.getInstance();
