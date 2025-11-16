"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
class UserRepository {
    constructor() { }
    static getInstance() {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }
    async create(userData) {
        return await user_model_1.User.create(userData);
    }
    async findById(id) {
        return await user_model_1.User.findByPk(id);
    }
    async findByEmail(email) {
        return await user_model_1.User.findOne({ where: { email } });
    }
    async findAll(limit = 10, offset = 0, filter) {
        const where = filter ? { ...filter } : {};
        return await user_model_1.User.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }
    async update(id, userData) {
        return await user_model_1.User.update(userData, {
            where: { id },
            returning: true
        });
    }
    async delete(id) {
        return await user_model_1.User.destroy({
            where: { id }
        });
    }
    async updateLastLogin(userId) {
        await user_model_1.User.update({ lastLogin: new Date() }, { where: { id: userId } });
    }
    async countByRole(role) {
        return await user_model_1.User.count({
            where: { role }
        });
    }
}
exports.default = UserRepository.getInstance();
