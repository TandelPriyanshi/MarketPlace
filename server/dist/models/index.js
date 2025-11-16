"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const order_model_1 = require("./order.model");
const orderItem_model_1 = require("./orderItem.model");
const user_model_1 = require("./user.model");
const product_model_1 = require("./product.model");
const seller_model_1 = require("./seller.model");
const deliveryPerson_model_1 = require("./deliveryPerson.model");
const salesman_model_1 = require("./salesman.model");
const beat_model_1 = require("./beat.model");
const store_model_1 = require("./store.model");
const visit_model_1 = require("./visit.model");
const complaint_model_1 = require("./complaint.model");
const attachment_model_1 = require("./attachment.model");
const notification_model_1 = require("./notification.model");
const config_1 = require("../config/config");
// Use the db configuration directly from config
const dbConfig = config_1.currentConfig.db;
// Initialize Sequelize with proper typing
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    modelPaths: [__dirname] // This tells Sequelize to look for models in the current directory
});
exports.sequelize = sequelize;
// Add models to Sequelize using string paths for better type safety
sequelize.addModels([
    `${__dirname}/user.model`,
    `${__dirname}/product.model`,
    `${__dirname}/order.model`,
    `${__dirname}/orderItem.model`,
    `${__dirname}/seller.model`,
    `${__dirname}/deliveryPerson.model`,
    `${__dirname}/salesman.model`,
    `${__dirname}/beat.model`,
    `${__dirname}/store.model`,
    `${__dirname}/visit.model`,
    `${__dirname}/complaint.model`,
    `${__dirname}/attachment.model`,
    `${__dirname}/notification.model`
]);
// Export models with proper typing
const models = {
    User: user_model_1.User,
    Product: product_model_1.Product,
    Order: order_model_1.Order,
    OrderItem: orderItem_model_1.OrderItem,
    Seller: seller_model_1.Seller,
    DeliveryPerson: deliveryPerson_model_1.DeliveryPerson,
    Salesman: salesman_model_1.Salesman,
    Beat: beat_model_1.Beat,
    Store: store_model_1.Store,
    Visit: visit_model_1.Visit,
    Complaint: complaint_model_1.Complaint,
    Attachment: attachment_model_1.Attachment,
    Notification: notification_model_1.Notification
};
exports.models = models;
exports.default = models;
