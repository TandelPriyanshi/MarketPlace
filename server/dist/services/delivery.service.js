"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/delivery.service.ts
const sequelize_1 = require("sequelize");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const user_model_1 = require("../models/user.model");
const product_model_1 = require("../models/product.model");
const attachment_model_1 = require("../models/attachment.model");
const db_1 = require("../db");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Helper function to create an attachment with all required fields
async function createAttachment(orderId, uploadedById, fileName, filePath, mimeType, type, notes, transaction) {
    try {
        // Get file stats to get the actual file size
        const stats = await fs_1.default.promises.stat(filePath);
        const attachmentData = {
            id: (0, uuid_1.v4)(),
            orderId,
            uploadedById,
            fileName,
            filePath,
            mimeType,
            type,
            size: stats.size,
            created_at: new Date(),
            updatedAt: new Date()
        };
        // Only include notes if it's provided
        if (notes !== undefined) {
            attachmentData.notes = notes;
        }
        return await attachment_model_1.Attachment.create(attachmentData, { transaction });
    }
    catch (error) {
        logger_1.logger.error('Error creating attachment:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to create attachment: ${error.message}`);
        }
        throw new Error('Failed to create attachment: Unknown error occurred');
    }
}
class DeliveryService {
    async getAssignedOrders(deliveryPersonId, status) {
        try {
            const where = {
                deliveryPersonId,
                status: order_model_1.OrderStatus.CONFIRMED,
            };
            if (status) {
                where.deliveryStatus = status;
            }
            const orders = await order_model_1.Order.findAll({
                where,
                include: [
                    {
                        model: user_model_1.User,
                        as: 'user',
                        attributes: ['id', 'name', 'phone', 'email'],
                    },
                    {
                        model: orderItem_model_1.OrderItem,
                        as: 'items',
                        include: [{
                                model: product_model_1.Product,
                                as: 'product',
                                attributes: ['id', 'name', 'price'],
                            }],
                    },
                ],
                order: [['createdAt', 'ASC']],
            });
            return orders;
        }
        catch (error) {
            logger_1.logger.error('Error fetching assigned orders:', error);
            throw error;
        }
    }
    async updateDeliveryStatus(orderId, deliveryPersonId, status, notes) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const order = await order_model_1.Order.findOne({
                where: { id: orderId, deliveryPersonId },
                transaction,
            });
            if (!order) {
                throw new Error('Order not found or not assigned to this delivery person');
            }
            this.validateDeliveryStatusTransition(order.deliveryStatus, status);
            const updateData = { deliveryStatus: status };
            if (status === order_model_1.DeliveryStatus.DELIVERED) {
                updateData.status = order_model_1.OrderStatus.COMPLETED;
            }
            if (notes) {
                updateData.deliveryNotes = notes;
            }
            await order.update(updateData, { transaction });
            await transaction.commit();
            return order;
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error updating delivery status:', error);
            throw error;
        }
    }
    async uploadDeliveryProof(orderId, deliveryPersonId, file, type, notes) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const order = await order_model_1.Order.findOne({
                where: { id: orderId, deliveryPersonId },
                transaction,
            });
            if (!order) {
                throw new Error('Order not found or not assigned to this delivery person');
            }
            // Create uploads directory if it doesn't exist
            const uploadDir = path_1.default.join(__dirname, '../../uploads');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            // Generate unique filename
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = `${(0, uuid_1.v4)()}${fileExt}`;
            const filePath = path_1.default.join('uploads', fileName);
            // Save file
            fs_1.default.writeFileSync(path_1.default.join(__dirname, '../../', filePath), file.buffer);
            // Create attachment for delivery proof
            const attachment = await createAttachment(orderId, deliveryPersonId, fileName, filePath, file.mimetype, 'delivery_proof', notes, transaction);
            await transaction.commit();
            return attachment;
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error uploading delivery proof:', error);
            throw error;
        }
    }
    async getTodaysRoute(deliveryPersonId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const orders = await order_model_1.Order.findAll({
                where: {
                    deliveryPersonId,
                    createdAt: {
                        [sequelize_1.Op.gte]: today,
                        [sequelize_1.Op.lt]: tomorrow,
                    },
                    status: order_model_1.OrderStatus.CONFIRMED,
                    deliveryStatus: {
                        [sequelize_1.Op.in]: [
                            order_model_1.DeliveryStatus.ASSIGNED,
                            order_model_1.DeliveryStatus.PICKED_UP,
                            order_model_1.DeliveryStatus.OUT_FOR_DELIVERY,
                        ],
                    },
                },
                include: [
                    {
                        model: user_model_1.User,
                        as: 'user',
                        attributes: ['id', 'name', 'phone', 'email', 'address'],
                    },
                    {
                        model: orderItem_model_1.OrderItem,
                        as: 'items',
                        include: [{
                                model: product_model_1.Product,
                                as: 'product',
                                attributes: ['id', 'name', 'price'],
                            }],
                    },
                ],
                order: [['createdAt', 'ASC']],
            });
            return orders;
        }
        catch (error) {
            logger_1.logger.error('Error fetching today\'s route:', error);
            throw error;
        }
    }
    validateDeliveryStatusTransition(currentStatus, newStatus) {
        const allowedTransitions = {
            [order_model_1.DeliveryStatus.PENDING]: [order_model_1.DeliveryStatus.ASSIGNED],
            [order_model_1.DeliveryStatus.ASSIGNED]: [order_model_1.DeliveryStatus.PICKED_UP, order_model_1.DeliveryStatus.CANCELLED],
            [order_model_1.DeliveryStatus.PICKED_UP]: [order_model_1.DeliveryStatus.OUT_FOR_DELIVERY, order_model_1.DeliveryStatus.RETURNED],
            [order_model_1.DeliveryStatus.OUT_FOR_DELIVERY]: [order_model_1.DeliveryStatus.DELIVERED, order_model_1.DeliveryStatus.RETURNED],
            [order_model_1.DeliveryStatus.DELIVERED]: [],
            [order_model_1.DeliveryStatus.RETURNED]: [],
            [order_model_1.DeliveryStatus.CANCELLED]: [],
        };
        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
}
exports.default = new DeliveryService();
