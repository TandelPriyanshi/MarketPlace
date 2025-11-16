"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeds = runSeeds;
const db_1 = require("../db");
const user_model_1 = require("../models/user.model");
const seller_model_1 = require("../models/seller.model");
const deliveryPerson_model_1 = require("../models/deliveryPerson.model");
const salesman_model_1 = require("../models/salesman.model");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const seedData_1 = require("./seedData");
const logger_1 = require("../utils/logger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function runSeeds() {
    try {
        await db_1.sequelize.authenticate();
        logger_1.logger.info('Database connected for seeding');
        // Clear existing data (optional - be careful in production!)
        // await sequelize.sync({ force: true });
        // Seed Users
        logger_1.logger.info('Seeding users...');
        const users = [];
        for (const userData of seedData_1.seedData.users) {
            const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
            const user = await user_model_1.User.create({
                ...userData,
                password_hash: hashedPassword,
            });
            users.push(user);
        }
        // Seed Sellers
        logger_1.logger.info('Seeding sellers...');
        const sellers = [];
        for (let i = 0; i < seedData_1.seedData.sellers.length; i++) {
            const sellerData = {
                ...seedData_1.seedData.sellers[i],
                userId: users[i].id, // First two users are sellers
            };
            const seller = await seller_model_1.Seller.create(sellerData);
            sellers.push(seller);
        }
        // Seed Delivery Persons
        logger_1.logger.info('Seeding delivery persons...');
        const deliveryPersons = [];
        const deliveryUser = users.find(u => u.role === user_model_1.UserRole.DELIVERY_PERSON);
        if (deliveryUser) {
            const deliveryData = {
                ...seedData_1.seedData.deliveryPersons[0],
                userId: deliveryUser.id,
            };
            const deliveryPerson = await deliveryPerson_model_1.DeliveryPerson.create(deliveryData);
            deliveryPersons.push(deliveryPerson);
        }
        // Seed Salesmen
        logger_1.logger.info('Seeding salesmen...');
        const salesmen = [];
        for (const salesmanData of seedData_1.seedData.salesmen) {
            const salesman = await salesman_model_1.Salesman.create(salesmanData);
            salesmen.push(salesman);
        }
        // Seed Products
        logger_1.logger.info('Seeding products...');
        const products = [];
        for (let i = 0; i < seedData_1.seedData.products.length; i++) {
            const productData = {
                ...seedData_1.seedData.products[i],
                sellerId: sellers[Math.floor(i / 2)].userId, // Alternate between sellers
            };
            const product = await product_model_1.Product.create(productData);
            products.push(product);
        }
        // Seed Beats
        logger_1.logger.info('Seeding beats...');
        const beats = [];
        for (const beatData of seedData_1.seedData.beats) {
            const beat = await beat_model_1.Beat.create({
                ...beatData,
                salesmanId: salesmen[0].id,
            });
            beats.push(beat);
        }
        // Seed Stores
        logger_1.logger.info('Seeding stores...');
        const stores = [];
        for (let i = 0; i < seedData_1.seedData.stores.length; i++) {
            const storeData = {
                ...seedData_1.seedData.stores[i],
                beatId: beats[0].id,
            };
            const store = await store_model_1.Store.create(storeData);
            stores.push(store);
        }
        // Seed Orders
        logger_1.logger.info('Seeding orders...');
        const customerUser = users.find(u => u.role === user_model_1.UserRole.CUSTOMER);
        if (customerUser) {
            const orderData = {
                ...seedData_1.seedData.orders[0],
                userId: customerUser.id,
            };
            const order = await order_model_1.Order.create(orderData);
            // Seed Order Items
            logger_1.logger.info('Seeding order items...');
            for (let i = 0; i < seedData_1.seedData.orderItems.length; i++) {
                const orderItemData = {
                    ...seedData_1.seedData.orderItems[i],
                    orderId: order.id,
                    productId: products[i].id,
                    sellerId: products[i].sellerId,
                };
                await orderItem_model_1.OrderItem.create(orderItemData);
            }
        }
        logger_1.logger.info('Seeding completed successfully!');
        logger_1.logger.info(`Created:
      - ${users.length} users
      - ${sellers.length} sellers
      - ${deliveryPersons.length} delivery persons
      - ${salesmen.length} salesmen
      - ${products.length} products
      - ${beats.length} beats
      - ${stores.length} stores
      - ${seedData_1.seedData.orders.length} orders
      - ${seedData_1.seedData.orderItems.length} order items
    `);
    }
    catch (error) {
        logger_1.logger.error('Error seeding database:', error);
        throw error;
    }
}
// Run seeds if this file is executed directly
if (require.main === module) {
    runSeeds()
        .then(() => {
        logger_1.logger.info('Seeding process completed');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.logger.error('Seeding process failed:', error);
        process.exit(1);
    });
}
