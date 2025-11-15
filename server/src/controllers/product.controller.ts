import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { logger } from '../utils/logger';

export class ProductController {
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, sellerId, search } = req.query;

      const result = await productService.getAllProducts({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
        sellerId: sellerId as string,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getAllProducts controller:', error);
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Error in getProductById controller:', error);
      next(error);
    }
  }
}

export const productController = new ProductController();

