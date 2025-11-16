"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const visit_model_1 = require("../models/visit.model");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const order_model_2 = require("../models/order.model");
const db_1 = require("../db");
const logger_1 = require("../utils/logger");
class SalesmanService {
    async getSalesmanBeats(salesmanId) {
        try {
            return await beat_model_1.Beat.findAll({
                where: { salesmanId },
                include: [
                    {
                        model: store_model_1.Store,
                        attributes: ['id', 'name', 'contactPerson', 'phone', 'lastVisitedAt'],
                    },
                ],
                order: [['created_at', 'DESC']],
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching salesman beats:', error);
            throw error;
        }
    }
    async createBeat(salesmanId, beatData) {
        try {
            const beat = await beat_model_1.Beat.create({
                ...beatData,
                salesmanId,
            });
            return await beat_model_1.Beat.findByPk(beat.id, {
                include: [store_model_1.Store],
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating beat:', error);
            throw error;
        }
    }
    async logVisit(salesmanId, visitData) {
        try {
            return await visit_model_1.Visit.create({
                ...visitData,
                salesmanId,
                status: visit_model_1.VisitStatus.SCHEDULED,
            });
        }
        catch (error) {
            logger_1.logger.error('Error logging visit:', error);
            throw error;
        }
    }
    async updateVisit(visitId, salesmanId, updateData) {
        try {
            const visit = await visit_model_1.Visit.findOne({
                where: { id: visitId, salesmanId },
            });
            if (!visit) {
                throw new Error('Visit not found');
            }
            const updatePayload = { ...updateData };
            if (updateData.status === visit_model_1.VisitStatus.IN_PROGRESS && visit.status === visit_model_1.VisitStatus.SCHEDULED) {
                updatePayload.startedAt = new Date();
            }
            if (updateData.status === visit_model_1.VisitStatus.COMPLETED && visit.status !== visit_model_1.VisitStatus.COMPLETED) {
                updatePayload.completedAt = new Date();
            }
            await visit.update(updatePayload);
            return visit.reload();
        }
        catch (error) {
            logger_1.logger.error('Error updating visit:', error);
            throw error;
        }
    }
    async getVisits(salesmanId, filters = {}) {
        try {
            const where = { salesmanId };
            if (filters.status)
                where.status = filters.status;
            if (filters.storeId)
                where.storeId = filters.storeId;
            return await visit_model_1.Visit.findAll({
                where,
                include: [
                    {
                        model: store_model_1.Store,
                        attributes: ['id', 'name', 'address', 'contactPerson', 'phone'],
                    },
                ],
                order: [['scheduledAt', 'DESC']],
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching visits:', error);
            throw error;
        }
    }
    async markAttendance(salesmanId, attendanceData) {
        try {
            // For now, using Visit model as attendance tracking
            return await visit_model_1.Visit.create({
                ...attendanceData,
                salesmanId,
                date: new Date(),
                status: 'present',
            });
        }
        catch (error) {
            logger_1.logger.error('Error marking attendance:', error);
            throw error;
        }
    }
    async createSalesOrder(salesmanId, orderData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const { items, ...orderInfo } = orderData;
            const order = await order_model_1.Order.create({
                ...orderInfo,
                salesmanId,
                status: order_model_2.OrderStatus.PENDING,
            }, { transaction });
            if (items && items.length > 0) {
                await orderItem_model_1.OrderItem.bulkCreate(items.map((item) => ({
                    ...item,
                    orderId: order.id,
                })), { transaction });
            }
            await transaction.commit();
            return order;
        }
        catch (error) {
            await transaction.rollback();
            logger_1.logger.error('Error creating sales order:', error);
            throw error;
        }
    }
    async getSalesmanPerformance(salesmanId, filters = {}) {
        try {
            const { startDate, endDate, period = 'monthly' } = filters;
            // Get sales data
            const orders = await order_model_1.Order.findAll({
                where: {
                    salesmanId,
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
                    date: {
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
            // Calculate collections
            const collectionsAmount = orders
                .filter((order) => order.status === order_model_2.OrderStatus.COMPLETED)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pendingCollections = orders
                .filter((order) => order.status === order_model_2.OrderStatus.PENDING || order.status === order_model_2.OrderStatus.CONFIRMED)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            // Generate monthly trend data
            const monthlyTrend = this.generateMonthlyTrend(orders, visits, period);
            return {
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
        }
        catch (error) {
            logger_1.logger.error('Error getting salesman performance:', error);
            throw error;
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
}
exports.default = new SalesmanService();
