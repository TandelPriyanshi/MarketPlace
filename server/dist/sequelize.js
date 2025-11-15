"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../src/config/config");
const dbConfig = config_1.currentConfig.db;
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
        max: dbConfig.pool?.max || 5,
        min: dbConfig.pool?.min || 0,
        acquire: dbConfig.pool?.acquire || 30000,
        idle: dbConfig.pool?.idle || 10000,
    },
    dialectOptions: {
        ...(process.env.DB_SSL === 'true' && {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }),
    },
});
exports.sequelize = sequelize;
// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
exports.testConnection = testConnection;
