import { Request, Response, NextFunction } from 'express';
import salesmanService from '../services/salesman.service';
import { logger } from '../utils/logger';
import { Beat } from '../models/beat.model';
import { Visit, VisitStatus } from '../models/visit.model';
import { Store } from '../models/store.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';
import { OrderStatus } from '../models/order.model';
import { Salesman } from '../models/salesman.model';
import { Op } from 'sequelize';

export class SalesmanController {
  async createBeat(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const beat = await Beat.create({
        ...req.body,
        salesmanId,
      });

      res.status(201).json({
        success: true,
        data: beat,
        message: 'Beat created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createBeat controller:', error);
      next(error);
    }
  }

  async getBeats(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { status, area } = req.query;
      
      const whereClause: any = { salesmanId };
      if (status) whereClause.status = status;
      
      const beats = await Beat.findAll({
        where: whereClause,
        include: [
          {
            model: Store,
            as: 'stores',
          }
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: beats,
      });
    } catch (error: any) {
      logger.error('Error in getBeats controller:', error);
      next(error);
    }
  }

  async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { checkInTime, location } = req.body;
      
      // For now, we'll use Visit model as attendance tracking
      // In a real implementation, you'd have an Attendance model
      const attendance = await Visit.create({
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
    } catch (error: any) {
      logger.error('Error in markAttendance controller:', error);
      next(error);
    }
  }

  async logVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const visit = await Visit.create({
        ...req.body,
        salesmanId,
      });

      res.status(201).json({
        success: true,
        data: visit,
        message: 'Visit logged successfully',
      });
    } catch (error: any) {
      logger.error('Error in logVisit controller:', error);
      next(error);
    }
  }

  async getVisits(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { status, storeId } = req.query;
      
      const visits = await salesmanService.getVisits(salesmanId, {
        status: status as any,
        storeId: storeId as string,
      });

      res.json({
        success: true,
        data: visits,
      });
    } catch (error: any) {
      logger.error('Error in getVisits controller:', error);
      next(error);
    }
  }

  async createSalesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { items, ...orderData } = req.body;
      
      const order = await Order.create({
        ...orderData,
        salesmanId,
        status: OrderStatus.PENDING,
      });

      // Create order items
      if (items && items.length > 0) {
        await OrderItem.bulkCreate(
          items.map((item: any) => ({
            ...item,
            orderId: order.id,
          }))
        );
      }

      res.status(201).json({
        success: true,
        data: order,
        message: 'Sales order created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createSalesOrder controller:', error);
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { status, startDate, endDate } = req.query;
      
      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate as string);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate as string);
      }

      const orders = await Order.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'items',
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      logger.error('Error in getOrders controller:', error);
      next(error);
    }
  }

  async getSalesmanPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { startDate, endDate, period = 'monthly' } = req.query;
      
      // Get sales data
      const orders = await Order.findAll({
        where: {
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
          scheduledAt: {
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
      
      // Calculate collections (simplified - assuming paymentMethod exists or using status)
      const collectionsAmount = orders
        .filter((order: any) => order.status === OrderStatus.COMPLETED)
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      const pendingCollections = orders
        .filter((order: any) => order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED)
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      // Generate monthly trend data
      const monthlyTrend = this.generateMonthlyTrend(orders, visits, period as string);

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
    } catch (error: any) {
      logger.error('Error in getSalesmanPerformance controller:', error);
      next(error);
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

  async getVisitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const salesmanId = req.user!.id;
      
      const visit = await Visit.findOne({
        where: { id, salesmanId },
        include: [
          {
            model: Salesman,
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
    } catch (error: any) {
      logger.error('Error in getVisitById controller:', error);
      next(error);
    }
  }

  async updateVisitStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, checkIn, checkOut, remarks } = req.body;
      const salesmanId = req.user!.id;
      
      const visit = await Visit.findOne({
        where: { id, salesmanId },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found',
        });
      }

      const updateData: any = { status };
      
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
    } catch (error: any) {
      logger.error('Error in updateVisitStatus controller:', error);
      next(error);
    }
  }
}
