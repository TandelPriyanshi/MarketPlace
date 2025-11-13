import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
import { logger } from '../utils/logger';

/**
 * Middleware to check if user has any of the required roles
 * @param roles Array of allowed roles
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // User should be attached by the auth middleware
    if (!req.user) {
      logger.warn('Unauthorized access - No user in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    // Check if user has any of the required roles
    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} with role ${req.user.role} tried to access ${req.path}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has a specific role
 * @param role Required role
 */
export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      logger.warn(`User ${req.user?.id} with role ${req.user?.role} tried to access ${req.path} which requires role ${role}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}`,
      });
    }
    next();
  };
};

/**
 * Middleware to check if the requested resource belongs to the user
 * @param paramName Name of the parameter containing the resource ID
 * @param model Sequelize model to check ownership
 * @param ownerField Field in the model that references the owner (default: 'userId')
 */
export const checkOwnership = (paramName: string, model: any, ownerField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user?.id;

      if (!resourceId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      const resource = await model.findOne({
        where: { id: resourceId },
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if the resource belongs to the user or if user is admin
      if (resource[ownerField] !== userId && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }

      // Attach the resource to the request for use in the controller
      (req as any).resource = resource;
      next();
    } catch (error) {
      logger.error('Error in checkOwnership middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};
