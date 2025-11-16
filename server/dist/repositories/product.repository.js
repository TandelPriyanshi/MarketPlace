"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const product_model_1 = require("../models/product.model");
const seller_model_1 = require("../models/seller.model");
class ProductRepository {
    constructor() { }
    static getInstance() {
        if (!ProductRepository.instance) {
            ProductRepository.instance = new ProductRepository();
        }
        return ProductRepository.instance;
    }
    async create(productData) {
        const product = new product_model_1.Product();
        Object.assign(product, {
            ...productData,
            rating: 0,
            reviewCount: 0
        });
        return await product.save();
    }
    async findById(id, includeSeller = false) {
        const options = { where: { id } };
        if (includeSeller) {
            options.include = [seller_model_1.Seller];
        }
        return await product_model_1.Product.findByPk(id, options);
    }
    async findBySeller(sellerId, limit = 10, offset = 0) {
        return await product_model_1.Product.findAndCountAll({
            where: { sellerId },
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }
    async search(query, category, minPrice, maxPrice, limit = 10, offset = 0) {
        const where = {
            [sequelize_1.Op.and]: [
                {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: `%${query}%` } },
                        { description: { [sequelize_1.Op.like]: `%${query}%` } }
                    ]
                },
                { isActive: true }
            ]
        };
        if (category)
            where.category = category;
        if (minPrice)
            where.price = { ...where.price, [sequelize_1.Op.gte]: minPrice };
        if (maxPrice)
            where.price = { ...where.price, [sequelize_1.Op.lte]: maxPrice };
        return await product_model_1.Product.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [seller_model_1.Seller]
        });
    }
    async update(id, productData) {
        return await product_model_1.Product.update(productData, {
            where: { id },
            returning: true
        });
    }
    async updateStock(id, quantity) {
        return await product_model_1.Product.update({ stock: quantity }, { where: { id }, returning: true });
    }
    async delete(id) {
        return await product_model_1.Product.destroy({
            where: { id }
        });
    }
    async updateRating(productId, newRating) {
        await product_model_1.Product.update({ rating: newRating }, { where: { id: productId } });
    }
    async incrementReviewCount(productId) {
        await product_model_1.Product.increment('reviewCount', {
            by: 1,
            where: { id: productId }
        });
    }
}
exports.default = ProductRepository.getInstance();
