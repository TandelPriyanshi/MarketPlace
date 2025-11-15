import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Seller } from '../models/seller.model';
import { DeliveryPerson } from '../models/deliveryPerson.model';
import { Salesman } from '../models/salesman.model';
import { Product } from '../models/product.model';
import { Order, OrderItemModel as OrderItem } from '../models/order.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit } from '../models/visit.model';
import { Complaint } from '../models/complaint.model';
import { Attachment } from '../models/attachment.model';
import { currentConfig } from '../config/config';

const sequelize = new Sequelize(
  currentConfig.db.database,
  currentConfig.db.username,
  currentConfig.db.password,
  {
    host: currentConfig.db.host,
    port: currentConfig.db.port,
    dialect: 'mysql',
    logging: currentConfig.db.logging,
  }
);

// Add models to Sequelize
sequelize.addModels([
  User as any,
  Seller as any,
  DeliveryPerson as any,
  Salesman as any,
  Product as any,
  Order as any,
  OrderItem as any,
  Beat as any,
  Store as any,
  Visit as any,
  Complaint as any,
  Attachment as any,
]);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    if (currentConfig.isDevelopment) {
      await sequelize.sync({ force: false, alter: false });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };