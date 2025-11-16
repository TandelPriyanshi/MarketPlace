import { Sequelize } from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderItem } from './orderItem.model';
import { User } from './user.model';
import { Product } from './product.model';
import { Seller } from './seller.model';
import { DeliveryPerson } from './deliveryPerson.model';
import { Salesman } from './salesman.model';
import { Beat } from './beat.model';
import { Store } from './store.model';
import { Visit } from './visit.model';
import { Complaint } from './complaint.model';
import { Attachment } from './attachment.model';
import { Notification } from './notification.model';
import { currentConfig } from '../config/config';

// Use the db configuration directly from config
const dbConfig = currentConfig.db;

// Create a type for the models to ensure type safety
interface DatabaseModels {
  User: typeof User;
  Product: typeof Product;
  Order: typeof Order;
  OrderItem: typeof OrderItem;
  Seller: typeof Seller;
  DeliveryPerson: typeof DeliveryPerson;
  Salesman: typeof Salesman;
  Beat: typeof Beat;
  Store: typeof Store;
  Visit: typeof Visit;
  Complaint: typeof Complaint;
  Attachment: typeof Attachment;
  Notification: typeof Notification;
}

// Initialize Sequelize with proper typing
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
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
  }
);

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
const models: DatabaseModels = {
  User,
  Product,
  Order,
  OrderItem,
  Seller,
  DeliveryPerson,
  Salesman,
  Beat,
  Store,
  Visit,
  Complaint,
  Attachment,
  Notification
};

export { sequelize, models, DatabaseModels };
export default models;