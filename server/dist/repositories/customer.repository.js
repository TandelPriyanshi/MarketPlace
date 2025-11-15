"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const order_model_1 = require("../models/order.model");
class CustomerRepository {
    constructor() { }
    static getInstance() {
        if (!CustomerRepository.instance) {
            CustomerRepository.instance = new CustomerRepository();
        }
        return CustomerRepository.instance;
    }
    async findById(id, includeOrders = false) {
        const options = {
            where: {
                id,
                role: user_model_1.UserRole.CUSTOMER
            }
        };
        if (includeOrders) {
            options.include = [
                {
                    model: order_model_1.Order,
                    as: 'orders',
                    limit: 10,
                    order: [['createdAt', 'DESC']]
                }
            ];
        }
        return await user_model_1.User.findOne(options);
    }
    async findByEmail(email) {
        return await user_model_1.User.findOne({
            where: {
                email,
                role: user_model_1.UserRole.CUSTOMER
            }
        });
    }
    async findAll(limit = 10, offset = 0, filter, sortBy = 'createdAt', sortOrder = 'DESC') {
        const where = {
            role: user_model_1.UserRole.CUSTOMER,
            ...filter
        };
        return await user_model_1.User.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]]
        });
    }
    async update(id, customerData) {
        return await user_model_1.User.update(customerData, {
            where: {
                id,
                role: user_model_1.UserRole.CUSTOMER
            },
            returning: true
        });
    }
    async delete(id) {
        return await user_model_1.User.destroy({
            where: {
                id,
                role: user_model_1.UserRole.CUSTOMER
            }
        });
    }
    async getCustomerStats(customerId) {
        const [orders, count] = await Promise.all([
            order_model_1.Order.findAll({
                where: {
                    userId: customerId,
                    status: 'completed'
                },
                attributes: ['totalAmount', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 1
            }),
            order_model_1.Order.count({
                where: {
                    userId: customerId,
                    status: 'completed'
                }
            })
        ]);
        const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const averageOrderValue = count > 0 ? totalSpent / count : 0;
        const lastOrderDate = orders[0]?.createdAt || null;
        return {
            totalOrders: count,
            totalSpent,
            lastOrderDate,
            averageOrderValue
        };
    }
    async searchCustomers(query, limit = 10) {
        return await user_model_1.User.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { role: user_model_1.UserRole.CUSTOMER },
                    {
                        [sequelize_1.Op.or]: [
                            { name: { [sequelize_1.Op.like]: `%${query}%` } },
                            { email: { [sequelize_1.Op.like]: `%${query}%` } },
                            { phone: { [sequelize_1.Op.like]: `%${query}%` } }
                        ]
                    }
                ]
            },
            limit,
            order: [['name', 'ASC']]
        });
    }
    async getTopCustomers(limit = 10) {
        // Using a raw query to avoid complex ORM limitations
        const [results] = await user_model_1.User.sequelize?.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email,
        COUNT(o.id) as "totalOrders",
        COALESCE(SUM(o."totalAmount"), 0) as "totalSpent"
      FROM 
        "users" u
      LEFT JOIN 
        "orders" o ON u.id = o."userId"
      WHERE 
        u.role = '${user_model_1.UserRole.CUSTOMER}'
      GROUP BY 
        u.id, u.name, u.email
      ORDER BY 
        "totalSpent" DESC
      LIMIT ${limit}
    `) || [[], 0];
        return results.map(result => ({
            id: result.id,
            name: result.name || 'Unknown',
            email: result.email,
            totalOrders: parseInt(result.totalOrders) || 0,
            totalSpent: parseFloat(result.totalSpent) || 0
        }));
    }
}
exports.default = CustomerRepository.getInstance();
