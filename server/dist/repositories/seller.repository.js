"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seller_model_1 = require("../models/seller.model");
const user_model_1 = require("../models/user.model");
class SellerRepository {
    constructor() { }
    static getInstance() {
        if (!SellerRepository.instance) {
            SellerRepository.instance = new SellerRepository();
        }
        return SellerRepository.instance;
    }
    async create(sellerData) {
        const seller = new seller_model_1.Seller();
        Object.assign(seller, {
            ...sellerData,
            rating: 0,
            totalSales: 0
        });
        return await seller.save();
    }
    async findById(id, includeUser = false) {
        const options = { where: { id } };
        if (includeUser) {
            options.include = [user_model_1.User];
        }
        return await seller_model_1.Seller.findByPk(id, options);
    }
    async findByUserId(userId) {
        return await seller_model_1.Seller.findOne({ where: { userId } });
    }
    async findAll(limit = 10, offset = 0, filter) {
        const where = filter ? { ...filter } : {};
        return await seller_model_1.Seller.findAndCountAll({
            where,
            limit,
            offset,
            include: [user_model_1.User],
            order: [['createdAt', 'DESC']]
        });
    }
    async update(id, sellerData) {
        return await seller_model_1.Seller.update(sellerData, {
            where: { id },
            returning: true
        });
    }
    async delete(id) {
        return await seller_model_1.Seller.destroy({
            where: { id }
        });
    }
    async updateRating(sellerId, newRating) {
        await seller_model_1.Seller.update({ rating: newRating }, { where: { id: sellerId } });
    }
    async incrementSales(sellerId, amount = 1) {
        await seller_model_1.Seller.increment('totalSales', {
            by: amount,
            where: { id: sellerId }
        });
    }
}
exports.default = SellerRepository.getInstance();
