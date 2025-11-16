"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanController = void 0;
const salesman_service_1 = __importDefault(require("../services/salesman.service"));
const logger_1 = require("../utils/logger");
const beat_model_1 = require("../models/beat.model");
const visit_model_1 = require("../models/visit.model");
const store_model_1 = require("../models/store.model");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const order_model_2 = require("../models/order.model");
const salesman_model_1 = require("../models/salesman.model");
const sequelize_1 = require("sequelize");
class SalesmanController {
    async createBeat(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const beat = await beat_model_1.Beat.create({
                ...req.body,
                salesmanId,
            });
            res.status(201).json({
                success: true,
                data: beat,
                message: 'Beat created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createBeat controller:', error);
            next(error);
        }
    }
    async getBeats(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { status, area } = req.query;
            const whereClause = { salesmanId };
            if (status)
                whereClause.status = status;
            const beats = await beat_model_1.Beat.findAll({
                where: whereClause,
                include: [
                    {
                        model: store_model_1.Store,
                        as: 'stores',
                    }
                ],
                order: [['created_at', 'DESC']],
            });
            res.json({
                success: true,
                data: beats,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getBeats controller:', error);
            next(error);
        }
    }
    async markAttendance(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { checkInTime, location } = req.body;
            // For now, we'll use Visit model as attendance tracking
            // In a real implementation, you'd have an Attendance model
            const attendance = await visit_model_1.Visit.create({
                salesmanId,
                scheduledAt: new Date(), // Use scheduledAt instead of date
                startedAt: checkInTime ? new Date(checkInTime) : new Date(),
                status: 'in_progress', // Use proper visit status
                purpose: 'Attendance check-in',
                location: location || null,
            });
            res.status(201).json({
                success: true,
                data: attendance,
                message: 'Attendance marked successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in markAttendance controller:', error);
            next(error);
        }
    }
    async logVisit(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const visit = await visit_model_1.Visit.create({
                ...req.body,
                salesmanId,
            });
            res.status(201).json({
                success: true,
                data: visit,
                message: 'Visit logged successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in logVisit controller:', error);
            next(error);
        }
    }
    async getVisits(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { status, storeId } = req.query;
            const visits = await salesman_service_1.default.getVisits(salesmanId, {
                status: status,
                storeId: storeId,
            });
            res.json({
                success: true,
                data: visits,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getVisits controller:', error);
            next(error);
        }
    }
    async createSalesOrder(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { items, ...orderData } = req.body;
            const order = await order_model_1.Order.create({
                ...orderData,
                salesmanId,
                status: order_model_2.OrderStatus.PENDING,
            });
            // Create order items
            if (items && items.length > 0) {
                await orderItem_model_1.OrderItem.bulkCreate(items.map((item) => ({
                    ...item,
                    orderId: order.id,
                })));
            }
            res.status(201).json({
                success: true,
                data: order,
                message: 'Sales order created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createSalesOrder controller:', error);
            next(error);
        }
    }
    async getOrders(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { status, startDate, endDate } = req.query;
            const whereClause = {};
            if (status)
                whereClause.status = status;
            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate)
                    whereClause.createdAt[sequelize_1.Op.gte] = new Date(startDate);
                if (endDate)
                    whereClause.createdAt[sequelize_1.Op.lte] = new Date(endDate);
            }
            const orders = await order_model_1.Order.findAll({
                where: whereClause,
                include: [
                    {
                        model: orderItem_model_1.OrderItem,
                        as: 'items',
                    }
                ],
                order: [['createdAt', 'DESC']],
            });
            res.json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getOrders controller:', error);
            next(error);
        }
    }
    async getSalesmanPerformance(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { startDate, endDate, period = 'monthly' } = req.query;
            // Get sales data
            const orders = await order_model_1.Order.findAll({
                where: {
                    createdAt: {
                        [sequelize_1.Op.gte]: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
                        [sequelize_1.Op.lte]: endDate || new Date(),
                    },
                },
                include: [
                    {
                        model: orderItem_model_1.OrderItem,
                        as: 'items',
                    }
                ],
            });
            // Get visits data
            const visits = await visit_model_1.Visit.findAll({
                where: {
                    salesmanId,
                    scheduledAt: {
                        [sequelize_1.Op.gte]: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
                        [sequelize_1.Op.lte]: endDate || new Date(),
                    },
                },
            });
            // Calculate performance metrics
            const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const totalOrders = orders.length;
            const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
            const visitsCompleted = visits.length;
            // Get unique stores visited
            const storesCovered = new Set(visits.map((v) => v.storeId)).size;
            // Calculate collections (simplified - assuming paymentMethod exists or using status)
            const collectionsAmount = orders
                .filter((order) => order.status === order_model_2.OrderStatus.COMPLETED)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pendingCollections = orders
                .filter((order) => order.status === order_model_2.OrderStatus.PENDING || order.status === order_model_2.OrderStatus.CONFIRMED)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            // Generate monthly trend data
            const monthlyTrend = this.generateMonthlyTrend(orders, visits, period);
            const performance = {
                totalSales,
                totalOrders,
                averageOrderValue,
                targetAchievement: 0, // Would need target data from beats
                visitsCompleted,
                storesCovered,
                collectionsAmount,
                pendingCollections,
                newStoresAdded: 0, // Would need to track new stores
                monthlyTrend,
            };
            res.json({
                success: true,
                data: performance,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getSalesmanPerformance controller:', error);
            next(error);
        }
    }
    generateMonthlyTrend(orders, visits, period) {
        // Simplified trend generation
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.slice(0, 3).map(month => ({
            month,
            sales: Math.floor(Math.random() * 10000),
            orders: Math.floor(Math.random() * 50),
            visits: Math.floor(Math.random() * 100),
        }));
    }
    async getVisitById(req, res, next) {
        try {
            const { id } = req.params;
            const salesmanId = req.user.id;
            const visit = await visit_model_1.Visit.findOne({
                where: { id, salesmanId },
                include: [
                    {
                        model: salesman_model_1.Salesman,
                        as: 'salesman',
                        attributes: ['id', 'name', 'email'],
                    }
                ]
            });
            if (!visit) {
                return res.status(404).json({
                    success: false,
                    message: 'Visit not found',
                });
            }
            res.json({
                success: true,
                data: visit,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getVisitById controller:', error);
            next(error);
        }
    }
    async updateVisitStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, checkIn, checkOut, remarks } = req.body;
            const salesmanId = req.user.id;
            const visit = await visit_model_1.Visit.findOne({
                where: { id, salesmanId },
            });
            if (!visit) {
                return res.status(404).json({
                    success: false,
                    message: 'Visit not found',
                });
            }
            const updateData = { status };
            if (checkIn) {
                updateData.startedAt = new Date();
                updateData.checkIn = {
                    timestamp: new Date(),
                    location: checkIn.location || {},
                    imageUrl: checkIn.imageUrl,
                };
            }
            if (checkOut) {
                updateData.completedAt = new Date();
                updateData.checkOut = {
                    timestamp: new Date(),
                    location: checkOut.location || {},
                    summary: checkOut.summary || '',
                };
            }
            if (remarks) {
                updateData.remarks = remarks;
            }
            await visit.update(updateData);
            res.json({
                success: true,
                data: visit,
                message: 'Visit status updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateVisitStatus controller:', error);
            next(error);
        }
    }
}
exports.SalesmanController = SalesmanController;
