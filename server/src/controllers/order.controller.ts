import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { logger } from '../utils/logger';

export class OrderController {
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await orderService.getUserOrders(userId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
      });

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
}

export const orderController = new OrderController();

