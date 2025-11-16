import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { logger } from '../utils/logger';

export class OrderController {
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { page, limit, status, startDate, endDate, search } = req.query;

      let result;
      if (userRole === 'seller') {
        result = await orderService.getSellerOrders(userId, {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10,
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
          search: search as string,
        });
      } else {
        result = await orderService.getCustomerOrders(userId, {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10,
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
          search: search as string,
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getAllOrders controller:', error);
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const order = await orderService.getOrderById(userId, id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in getOrderById controller:', error);
      next(error);
    }
  }

  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const orderData = req.body;

      const order = await orderService.placeOrder(customerId, orderData);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed successfully',
      });
    } catch (error: any) {
      logger.error('Error in placeOrder controller:', error);
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { status, notes, trackingNumber, estimatedDelivery } = req.body;

      const order = await orderService.updateOrderStatus(userId, id, {
        status,
        notes,
        trackingNumber,
        estimatedDelivery,
        userRole,
      });

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateOrderStatus controller:', error);
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(userId, id, reason);

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled successfully',
      });
    } catch (error: any) {
      logger.error('Error in cancelOrder controller:', error);
      next(error);
    }
  }

  async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const { page, limit, status, startDate, endDate, search } = req.query;

      const result = await orderService.getCustomerOrders(customerId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getCustomerOrders controller:', error);
      next(error);
    }
  }

  async getSellerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { page, limit, status, startDate, endDate, search } = req.query;

      const result = await orderService.getSellerOrders(sellerId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getSellerOrders controller:', error);
      next(error);
    }
  }
}

export const orderController = new OrderController();

