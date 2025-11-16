"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../models/user.model");
const seller_model_1 = require("../models/seller.model");
const deliveryPerson_model_1 = require("../models/deliveryPerson.model");
const salesman_model_1 = require("../models/salesman.model");
const product_model_1 = require("../models/product.model");
const order_model_1 = require("../models/order.model");
const orderItem_model_1 = require("../models/orderItem.model");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const visit_model_1 = require("../models/visit.model");
const complaint_model_1 = require("../models/complaint.model");
const attachment_model_1 = require("../models/attachment.model");
const notification_model_1 = require("../models/notification.model");
const config_1 = require("../config/config");
const sequelize = new sequelize_typescript_1.Sequelize(config_1.currentConfig.db.database, config_1.currentConfig.db.username, config_1.currentConfig.db.password, {
    host: config_1.currentConfig.db.host,
    port: config_1.currentConfig.db.port,
    dialect: 'mysql',
    logging: config_1.currentConfig.db.logging,
});
exports.sequelize = sequelize;
// Add models to Sequelize
sequelize.addModels([
    user_model_1.User,
    seller_model_1.Seller,
    deliveryPerson_model_1.DeliveryPerson,
    salesman_model_1.Salesman,
    product_model_1.Product,
    order_model_1.Order,
    orderItem_model_1.OrderItem,
    beat_model_1.Beat,
    store_model_1.Store,
    visit_model_1.Visit,
    complaint_model_1.Complaint,
    attachment_model_1.Attachment,
    notification_model_1.Notification,
]);
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        if (config_1.currentConfig.isDevelopment) {
            await sequelize.sync({ force: false, alter: false });
            console.log('Database synchronized');
        }
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
