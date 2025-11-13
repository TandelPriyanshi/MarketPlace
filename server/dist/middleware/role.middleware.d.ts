import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
/**
 * Middleware to check if user has any of the required roles
 * @param roles Array of allowed roles
 */
export declare const authorize: (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if user has a specific role
 * @param role Required role
 */
export declare const requireRole: (role: UserRole) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if the requested resource belongs to the user
 * @param paramName Name of the parameter containing the resource ID
 * @param model Sequelize model to check ownership
 * @param ownerField Field in the model that references the owner (default: 'userId')
 */
export declare const checkOwnership: (paramName: string, model: any, ownerField?: string) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=role.middleware.d.ts.map