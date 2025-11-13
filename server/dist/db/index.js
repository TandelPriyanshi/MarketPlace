"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
// src/db/index.ts
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../models/user.model");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const attachment_model_1 = require("../models/attachment.model");
const config_1 = require("../config/config");
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mysql',
    host: config_1.config.db.host,
    port: config_1.config.db.port,
    username: config_1.config.db.username,
    password: config_1.config.db.password,
    database: config_1.config.db.database,
    models: [user_model_1.User, product_model_1.Product, order_model_1.Order, order_model_1.OrderItemModel, attachment_model_1.Attachment],
    logging: config_1.config.isProduction ? false : console.log,
});
exports.sequelize = sequelize;
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        if (!config_1.config.isProduction) {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized');
        }
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
