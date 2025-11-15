import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { logger } from '../utils/logger';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      logger.error('Error in getUserById controller:', error);
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, search } = req.query;

      const result = await userService.getAllUsers({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        role: role as any,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getAllUsers controller:', error);
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateUser controller:', error);
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.deactivateUser(id);

      res.json({
        success: true,
        data: user,
        message: 'User deactivated successfully',
      });
    } catch (error: any) {
      logger.error('Error in deactivateUser controller:', error);
      next(error);
    }
  }

  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.activateUser(id);

      res.json({
        success: true,
        data: user,
        message: 'User activated successfully',
      });
    } catch (error: any) {
      logger.error('Error in activateUser controller:', error);
      next(error);
    }
  }
}

export const userController = new UserController();

