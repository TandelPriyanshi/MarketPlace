"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const errors_1 = require("../utils/errors");
class UserService {
    async getUserById(userId) {
        const user = await user_repository_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async getAllUsers(options) {
        const { page = 1, limit = 10, role, search } = options;
        const filter = {};
        if (role)
            filter.role = role;
        if (search) {
            filter[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${search}%` } },
                { email: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const result = await user_repository_1.default.findAll(limit, (page - 1) * limit, filter);
        return {
            users: result.rows,
            pagination: {
                total: result.count,
                page,
                totalPages: Math.ceil(result.count / limit),
                limit,
            },
        };
    }
    async updateUser(userId, updateData) {
        const user = await user_repository_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        await user_repository_1.default.update(userId, updateData);
        return (await user_repository_1.default.findById(userId));
    }
    async deactivateUser(userId) {
        return await this.updateUser(userId, { isActive: false });
    }
    async activateUser(userId) {
        return await this.updateUser(userId, { isActive: true });
    }
}
exports.default = new UserService();
