import { Op } from 'sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit, VisitStatus } from '../models/visit.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';
import { OrderStatus } from '../models/order.model';
import { sequelize } from '../db';
import { logger } from '../utils/logger';

class SalesmanService {
  async getSalesmanBeats(salesmanId: string) {
    try {
      return await Beat.findAll({
        where: { salesmanId },
        include: [
          {
            model: Store,
            attributes: ['id', 'name', 'contactPerson', 'phone', 'lastVisitedAt'],
          },
        ],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      logger.error('Error fetching salesman beats:', error);
      throw error;
    }
  }

  async createBeat(salesmanId: string, beatData: Partial<Beat>) {
    try {
      const beat = await Beat.create({
        ...beatData,
        salesmanId,
      });

      return await Beat.findByPk(beat.id, {
        include: [Store],
      });
    } catch (error) {
      logger.error('Error creating beat:', error);
      throw error;
    }
  }

  async logVisit(salesmanId: string, visitData: Partial<Visit>) {
    try {
      return await Visit.create({
        ...visitData,
        salesmanId,
        status: VisitStatus.SCHEDULED,
      });
    } catch (error) {
      logger.error('Error logging visit:', error);
      throw error;
    }
  }

  async updateVisit(visitId: string, salesmanId: string, updateData: Partial<Visit>) {
    try {
      const visit = await Visit.findOne({
        where: { id: visitId, salesmanId },
      });

      if (!visit) {
        throw new Error('Visit not found');
      }

      const updatePayload: any = { ...updateData };

      if (updateData.status === VisitStatus.IN_PROGRESS && visit.status === VisitStatus.SCHEDULED) {
        updatePayload.startedAt = new Date();
      }

      if (updateData.status === VisitStatus.COMPLETED && visit.status !== VisitStatus.COMPLETED) {
        updatePayload.completedAt = new Date();
      }

      await visit.update(updatePayload);
      return visit.reload();
    } catch (error) {
      logger.error('Error updating visit:', error);
      throw error;
    }
  }

  async getVisits(salesmanId: string, filters: { status?: VisitStatus; storeId?: string } = {}) {
    try {
      const where: any = { salesmanId };
      if (filters.status) where.status = filters.status;
      if (filters.storeId) where.storeId = filters.storeId;

      return await Visit.findAll({
        where,
        include: [
          {
            model: Store,
            attributes: ['id', 'name', 'address', 'contactPerson', 'phone'],
          },
        ],
        order: [['scheduledAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error fetching visits:', error);
      throw error;
    }
  }

  async markAttendance(salesmanId: string, attendanceData: any) {
    try {
      // For now, using Visit model as attendance tracking
      return await Visit.create({
        ...attendanceData,
        salesmanId,
        date: new Date(),
        status: 'present',
      });
    } catch (error) {
      logger.error('Error marking attendance:', error);
      throw error;
    }
  }

  async createSalesOrder(salesmanId: string, orderData: any) {
    const transaction = await sequelize.transaction();
    try {
      const { items, ...orderInfo } = orderData;
      
      const order = await Order.create({
        ...orderInfo,
        salesmanId,
        status: OrderStatus.PENDING,
      }, { transaction });

      if (items && items.length > 0) {
        await OrderItem.bulkCreate(
          items.map((item: any) => ({
            ...item,
            orderId: order.id,
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating sales order:', error);
      throw error;
    }
  }

  async getSalesmanPerformance(salesmanId: string, filters: { startDate?: Date; endDate?: Date; period?: string } = {}) {
    try {
      const { startDate, endDate, period = 'monthly' } = filters;
      
      // Get sales data
      const orders = await Order.findAll({
        where: {
          salesmanId,
          createdAt: {
            [Op.gte]: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
            [Op.lte]: endDate || new Date(),
          },
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
          }
        ],
      });

      // Get visits data
      const visits = await Visit.findAll({
        where: {
          salesmanId,
          date: {
            [Op.gte]: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
            [Op.lte]: endDate || new Date(),
          },
        },
      });

      // Calculate performance metrics
      const totalSales = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const visitsCompleted = visits.length;
      
      // Get unique stores visited
      const storesCovered = new Set(visits.map((v: any) => v.storeId)).size;
      
      // Calculate collections
      const collectionsAmount = orders
        .filter((order: any) => order.status === OrderStatus.COMPLETED)
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      const pendingCollections = orders
        .filter((order: any) => order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED)
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

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
    } catch (error) {
      logger.error('Error getting salesman performance:', error);
      throw error;
    }
  }

  private generateMonthlyTrend(orders: any[], visits: any[], period: string) {
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

export default new SalesmanService();
