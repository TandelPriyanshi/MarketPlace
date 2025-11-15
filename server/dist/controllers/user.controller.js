"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = __importDefault(require("../services/user.service"));
const logger_1 = require("../utils/logger");
class UserController {
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.getUserById(id);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getUserById controller:', error);
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const { page, limit, role, search } = req.query;
            const result = await user_service_1.default.getAllUsers({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                role: role,
                search: search,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAllUsers controller:', error);
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.updateUser(id, req.body);
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateUser controller:', error);
            next(error);
        }
    }
    async deactivateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.deactivateUser(id);
            res.json({
                success: true,
                data: user,
                message: 'User deactivated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deactivateUser controller:', error);
            next(error);
        }
    }
    async activateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.activateUser(id);
            res.json({
                success: true,
                data: user,
                message: 'User activated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in activateUser controller:', error);
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
