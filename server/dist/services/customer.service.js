"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const order_model_1 = require("../models/order.model");
const complaint_model_1 = require("../models/complaint.model");
const product_model_1 = require("../models/product.model");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
class CustomerService {
    // Get all sellers with optional filters
    async getSellers(filters) {
        try {
            const whereClause = { role: user_model_1.UserRole.SELLER, isActive: true };
            if (filters.city)
                whereClause.city = { [sequelize_1.Op.iLike]: `%${filters.city}%` };
            if (filters.area)
                whereClause.area = { [sequelize_1.Op.iLike]: `%${filters.area}%` };
            if (filters.pincode)
                whereClause.pincode = filters.pincode;
            const sellers = await user_model_1.User.findAll({
                where: whereClause,
                attributes: ['id', 'name', 'email', 'phone', 'profileImage', 'rating', 'totalRatings'],
                include: [
                    {
                        model: product_model_1.Product,
                        as: 'products',
                        where: { status: 'published' },
                        required: false,
                        attributes: ['id', 'name', 'price', 'images'],
                    },
                ],
            });
            return sellers;
        }
        catch (error) {
            logger_1.logger.error('Error in getSellers:', error);
            throw new Error('Failed to fetch sellers');
        }
    }
    // Place a new order
    async placeOrder(userId, orderData) {
        const transaction = await order_model_1.Order.sequelize.transaction();
        try {
            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Calculate total amount and validate products
            let totalAmount = 0;
            const orderItems = [];
            for (const item of orderData.items) {
                const product = await product_model_1.Product.findByPk(item.productId, { transaction });
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                // Update product stock
                product.stock -= item.quantity;
                await product.save({ transaction });
                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;
                orderItems.push({
                    productId: product.id,
                    sellerId: product.sellerId,
                    quantity: item.quantity,
                    price: product.price,
                    status: order_model_1.OrderStatus.PENDING,
                });
            }
            // Create order
            const order = await order_model_1.Order.create({
                userId,
                orderNumber,
                totalAmount,
                status: order_model_1.OrderStatus.PENDING,
                paymentStatus: 'pending',
                deliveryStatus: 'pending',
                shippingAddress: orderData.shippingAddress,
                billingAddress: orderData.billingAddress || orderData.shippingAddress,
            }, { transaction, include: ['items'] });
            // Create order items
            await Promise.all(orderItems.map((item) => order.createOrderItem(item, { transaction })));
            await transaction.commit();
            // TODO: Trigger payment process
            return order;
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error in placeOrder:', error);
            throw error;
        }
    }
    // Get order details by ID
    async getOrderDetails(userId, orderId) {
        try {
            const order = await order_model_1.Order.findOne({
                where: { id: orderId, userId },
                include: [
                    {
                        model: order_model_1.Order.associations.items,
                        include: [
                            { model: product_model_1.Product, as: 'product' },
                            { model: user_model_1.User, as: 'seller' },
                        ],
                    },
                ],
            });
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        }
        catch (error) {
            logger_1.logger.error('Error in getOrderDetails:', error);
            throw error;
        }
    }
    // Create a new complaint
    async createComplaint(userId, complaintData, files) {
        try {
            // Validate order exists and belongs to user if provided
            if (complaintData.orderId) {
                const order = await order_model_1.Order.findOne({
                    where: { id: complaintData.orderId, userId },
                });
                if (!order) {
                    throw new Error('Order not found or access denied');
                }
            }
            // Handle file uploads if any
            const attachments = [];
            if (files && files.length > 0) {
                const uploadDir = path_1.default.join(__dirname, '../../uploads/complaints');
                // Create uploads directory if it doesn't exist
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                // Process each file
                for (const file of files) {
                    const fileExt = path_1.default.extname(file.originalname);
                    const fileName = `${(0, uuid_1.v4)()}${fileExt}`;
                    const filePath = path_1.default.join(uploadDir, fileName);
                    await writeFileAsync(filePath, file.buffer);
                    attachments.push(`/uploads/complaints/${fileName}`);
                }
            }
            // Create complaint
            const complaint = await complaint_model_1.Complaint.create({
                userId,
                orderId: complaintData.orderId || null,
                type: complaintData.type,
                title: complaintData.title,
                description: complaintData.description,
                status: complaint_model_1.ComplaintStatus.OPEN,
                attachments,
            });
            // TODO: Send notification to admin/seller
            return complaint;
        }
        catch (error) {
            logger_1.logger.error('Error in createComplaint:', error);
            throw error;
        }
    }
    // Get all complaints for a user
    async getUserComplaints(userId, filters = {}) {
        try {
            const whereClause = { userId };
            if (filters.status) {
                whereClause.status = filters.status;
            }
            const complaints = await complaint_model_1.Complaint.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: order_model_1.Order, attributes: ['id', 'orderNumber'] },
                    { model: user_model_1.User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
                ],
            });
            return complaints;
        }
        catch (error) {
            logger_1.logger.error('Error in getUserComplaints:', error);
            throw error;
        }
    }
}
exports.customerService = new CustomerService();
