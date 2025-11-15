import { Request, Response, NextFunction } from 'express';
import sellerService from '../services/seller.service';
import { logger } from '../utils/logger';

export class SellerController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await sellerService.getSellerProducts(sellerId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getProducts controller:', error);
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const product = await sellerService.createProduct(sellerId, req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createProduct controller:', error);
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      const product = await sellerService.updateProduct(sellerId, id, req.body);

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateProduct controller:', error);
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      await sellerService.deleteProduct(sellerId, id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteProduct controller:', error);
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await sellerService.getSellerOrders(sellerId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getOrders controller:', error);
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const { id } = req.params;
      const { status, reason } = req.body;

      const orderItem = await sellerService.updateOrderStatus(sellerId, id, status, reason);

      res.json({
        success: true,
        data: orderItem,
        message: 'Order status updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateOrderStatus controller:', error);
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const dashboard = await sellerService.getSellerDashboard(sellerId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      logger.error('Error in getDashboard controller:', error);
      next(error);
    }
  }
}

export const sellerController = new SellerController();

