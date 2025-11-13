// src/db/index.ts
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Order, OrderItemModel as OrderItem } from '../models/order.model';
import { Attachment } from '../models/attachment.model';
import { config } from '../config/config';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  models: [User, Product, Order, OrderItem, Attachment],
  logging: config.isProduction ? false : console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    if (!config.isProduction) {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };