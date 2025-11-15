"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const sequelize_1 = require("sequelize");
const product_model_1 = require("../models/product.model");
const category_model_1 = require("../models/category.model");
const review_model_1 = require("../models/review.model");
const order_model_1 = require("../models/order.model");
const db_1 = require("../db");
const errors_1 = require("../utils/errors");
class ProductService {
    /**
     * Create a new product
     */
    async createProduct(productData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Validate required fields
            if (!productData.name || !productData.price || !productData.sellerId) {
                throw new errors_1.ValidationError('Name, price, and sellerId are required');
            }
            // Check if product with same SKU already exists
            if (productData.sku) {
                const existingProduct = await product_model_1.Product.findOne({
                    where: { sku: productData.sku },
                    transaction
                });
                if (existingProduct) {
                    throw new errors_1.ValidationError('Product with this SKU already exists');
                }
            }
            // Create the product
            const product = await product_model_1.Product.create({
                ...productData,
                status: product_model_1.ProductStatus.DRAFT,
                rating: 0,
                reviewCount: 0,
            }, { transaction });
            await transaction.commit();
            return product;
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError)
                throw error;
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to create product', error);
            }
            throw new errors_1.DatabaseError('Failed to create product', new Error(String(error)));
        }
    }
    /**
     * Update an existing product
     */
    async updateProduct(productId, updateData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Find the product
            const product = await product_model_1.Product.findOne({
                where: { id: productId },
                transaction
            });
            if (!product) {
                throw new errors_1.NotFoundError('Product not found');
            }
            // Disallow updating certain fields directly
            const { id, sellerId: _, ...safeUpdateData } = updateData;
            if (Object.keys(safeUpdateData).length === 0) {
                throw new errors_1.ValidationError('No valid fields to update');
            }
            // Update the product
            await product.update(safeUpdateData, { transaction });
            await transaction.commit();
            return product.reload();
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.NotFoundError)
                throw error;
            if (error instanceof errors_1.ValidationError)
                throw error;
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to update product', error);
            }
            throw new errors_1.DatabaseError('Failed to update product', new Error(String(error)));
        }
    }
    /**
     * Get product by ID with optional seller verification
     */
    async getProductById(productId, sellerId) {
        const where = { id: productId };
        if (sellerId)
            where.sellerId = sellerId;
        const product = await product_model_1.Product.findOne({
            where,
            include: [
                { model: category_model_1.Category, as: 'categories' },
                {
                    model: review_model_1.Review,
                    as: 'reviews',
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }
            ]
        });
        if (!product) {
            throw new errors_1.NotFoundError('Product not found');
        }
        return product;
    }
    /**
     * List products with pagination and filters
     */
    async listProducts({ page = 1, limit = 10, categoryId, sellerId, minPrice, maxPrice, searchQuery, status = product_model_1.ProductStatus.PUBLISHED }) {
        const where = {};
        if (status)
            where.status = status;
        if (sellerId)
            where.sellerId = sellerId;
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price[sequelize_1.Op.gte] = minPrice;
            if (maxPrice !== undefined)
                where.price[sequelize_1.Op.lte] = maxPrice;
        }
        if (searchQuery) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${searchQuery}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${searchQuery}%` } },
                { sku: { [sequelize_1.Op.iLike]: `%${searchQuery}%` } }
            ];
        }
        if (categoryId) {
            where['$categories.id$'] = categoryId;
        }
        const { count, rows } = await product_model_1.Product.findAndCountAll({
            where,
            include: categoryId ? [
                {
                    model: category_model_1.Category,
                    as: 'categories',
                    where: { id: categoryId },
                    required: true
                }
            ] : [],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
            distinct: true
        });
        return {
            products: rows,
            total: count
        };
    }
    /**
     * Update product stock (increment/decrement)
     */
    async updateStock(productId, quantity, operation = 'set') {
        const product = await product_model_1.Product.findByPk(productId);
        if (!product) {
            throw new errors_1.NotFoundError('Product not found');
        }
        const transaction = await db_1.sequelize.transaction();
        try {
            let newStock = product.stock;
            if (operation === 'increment') {
                newStock += quantity;
            }
            else if (operation === 'decrement') {
                if (product.stock < quantity) {
                    throw new errors_1.ValidationError('Insufficient stock');
                }
                newStock -= quantity;
            }
            else {
                newStock = quantity;
            }
            if (newStock < 0) {
                throw new errors_1.ValidationError('Stock cannot be negative');
            }
            await product.update({ stock: newStock }, { transaction });
            // If stock reaches zero, update status to OUT_OF_STOCK if not already
            if (newStock === 0 && product.status !== product_model_1.ProductStatus.OUT_OF_STOCK) {
                await product.update({ status: product_model_1.ProductStatus.OUT_OF_STOCK }, { transaction });
            }
            // If stock is back in stock, update status to PUBLISHED
            else if (newStock > 0 && product.status === product_model_1.ProductStatus.OUT_OF_STOCK) {
                await product.update({ status: product_model_1.ProductStatus.PUBLISHED }, { transaction });
            }
            await transaction.commit();
            return product.reload();
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError || error instanceof errors_1.NotFoundError)
                throw error;
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to update product stock', error);
            }
            throw new errors_1.DatabaseError('Failed to update product stock', new Error(String(error)));
        }
    }
    /**
     * Update product status
     */
    async updateProductStatus(productId, sellerId, status) {
        const product = await product_model_1.Product.findOne({ where: { id: productId, sellerId } });
        if (!product) {
            throw new errors_1.NotFoundError('Product not found or access denied');
        }
        // Additional validation can be added here based on business rules
        // For example, prevent setting to PUBLISHED if required fields are missing
        return product.update({ status });
    }
    /**
     * Get product statistics
     */
    async getProductStats() {
        const [totalProducts, publishedCount, outOfStockCount, lowStockCount] = await Promise.all([
            product_model_1.Product.count(),
            product_model_1.Product.count({ where: { status: product_model_1.ProductStatus.PUBLISHED } }),
            product_model_1.Product.count({ where: { status: product_model_1.ProductStatus.OUT_OF_STOCK } }),
            product_model_1.Product.count({
                where: {
                    stock: { [sequelize_1.Op.lt]: 10 }, // Consider products with less than 10 items as low stock
                    status: product_model_1.ProductStatus.PUBLISHED
                }
            }),
        ]);
        // Get top selling products
        const topSellingRaw = await order_model_1.OrderItem.findAll({
            attributes: [
                'productId',
                [db_1.sequelize.fn('SUM', db_1.sequelize.col('quantity')), 'totalSold']
            ],
            include: [{
                    model: product_model_1.Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price'],
                    required: true
                }],
            group: ['productId', 'product.id'],
            order: [[db_1.sequelize.literal('totalSold'), 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });
        // Transform the raw data to match the expected type
        const topSelling = topSellingRaw.map(item => {
            // Type assertion for the raw query result
            const typedItem = item;
            return {
                productId: typedItem.productId,
                totalSold: typeof typedItem.totalSold === 'string'
                    ? parseInt(typedItem.totalSold, 10)
                    : typedItem.totalSold,
                product: {
                    id: typedItem['product.id'],
                    name: typedItem['product.name'],
                    price: typeof typedItem['product.price'] === 'string'
                        ? parseFloat(typedItem['product.price'])
                        : typedItem['product.price']
                }
            };
        });
        return {
            totalProducts,
            publishedCount: publishedCount,
            outOfStockCount: outOfStockCount,
            lowStockCount: lowStockCount,
            topSelling
        };
    }
    /**
     * Get all products with filters
     */
    async getAllProducts(options) {
        const { page = 1, limit = 10, status, sellerId, search } = options;
        const where = {};
        if (status)
            where.status = status;
        if (sellerId)
            where.sellerId = sellerId;
        if (search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${search}%` } },
                { description: { [sequelize_1.Op.like]: `%${search}%` } },
                { sku: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const { count, rows } = await product_model_1.Product.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
        });
        return {
            products: rows,
            pagination: {
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
                limit,
            },
        };
    }
    /**
     * Delete a product (soft delete)
     */
    async deleteProduct(productId, sellerId) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Check if there are any active orders for this product
            const activeOrderItems = await order_model_1.OrderItem.count({
                where: { productId },
                include: [
                    {
                        model: order_model_1.Order,
                        as: 'order',
                        where: {
                            status: {
                                [sequelize_1.Op.notIn]: ['cancelled', 'delivered', 'returned', 'refunded']
                            }
                        },
                        required: true
                    }
                ],
                transaction
            });
            if (activeOrderItems > 0) {
                throw new errors_1.ValidationError('Cannot delete product with active orders');
            }
            // Soft delete the product
            const deleted = await product_model_1.Product.update({ status: product_model_1.ProductStatus.ARCHIVED }, {
                where: { id: productId, sellerId },
                transaction
            });
            await transaction.commit();
            return deleted[0] > 0;
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError)
                throw error;
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to delete product', error);
            }
            throw new errors_1.DatabaseError('Failed to delete product', new Error(String(error)));
        }
    }
}
exports.productService = new ProductService();
