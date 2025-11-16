import { sequelize } from '../db';
import { User, UserRole as ModelUserRole } from '../models/user.model';
import { Seller } from '../models/seller.model';
import { DeliveryPerson } from '../models/deliveryPerson.model';
import { Salesman } from '../models/salesman.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { seedData } from './seedData';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export async function runSeeds() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected for seeding');

    // Clear existing data (optional - be careful in production!)
    // await sequelize.sync({ force: true });

    // Seed Users
    logger.info('Seeding users...');
    const users = [];
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        ...userData,
        password_hash: hashedPassword,
      });
      users.push(user);
    }

    // Seed Sellers
    logger.info('Seeding sellers...');
    const sellers = [];
    for (let i = 0; i < seedData.sellers.length; i++) {
      const sellerData = {
        ...seedData.sellers[i],
        userId: users[i].id, // First two users are sellers
      };
      const seller = await Seller.create(sellerData as any);
      sellers.push(seller);
    }

    // Seed Delivery Persons
    logger.info('Seeding delivery persons...');
    const deliveryPersons = [];
    const deliveryUser = users.find(u => u.role === ModelUserRole.DELIVERY_PERSON);
    if (deliveryUser) {
      const deliveryData = {
        ...seedData.deliveryPersons[0],
        userId: deliveryUser.id,
      };
      const deliveryPerson = await DeliveryPerson.create(deliveryData as any);
      deliveryPersons.push(deliveryPerson);
    }

    // Seed Salesmen
    logger.info('Seeding salesmen...');
    const salesmen = [];
    for (const salesmanData of seedData.salesmen) {
      const salesman = await Salesman.create(salesmanData);
      salesmen.push(salesman);
    }

    // Seed Products
    logger.info('Seeding products...');
    const products = [];
    for (let i = 0; i < seedData.products.length; i++) {
      const productData = {
        ...seedData.products[i],
        sellerId: sellers[Math.floor(i / 2)].userId, // Alternate between sellers
      };
      const product = await Product.create(productData);
      products.push(product);
    }

    // Seed Beats
    logger.info('Seeding beats...');
    const beats = [];
    for (const beatData of seedData.beats) {
      const beat = await Beat.create({
        ...beatData,
        salesmanId: salesmen[0].id,
      });
      beats.push(beat);
    }

    // Seed Stores
    logger.info('Seeding stores...');
    const stores = [];
    for (let i = 0; i < seedData.stores.length; i++) {
      const storeData = {
        ...seedData.stores[i],
        beatId: beats[0].id,
      };
      const store = await Store.create(storeData);
      stores.push(store);
    }

    // Seed Orders
    logger.info('Seeding orders...');
    const customerUser = users.find(u => u.role === ModelUserRole.CUSTOMER);
    if (customerUser) {
      const orderData = {
        ...seedData.orders[0],
        userId: customerUser.id,
      };
      const order = await Order.create(orderData);

      // Seed Order Items
      logger.info('Seeding order items...');
      for (let i = 0; i < seedData.orderItems.length; i++) {
        const orderItemData = {
          ...seedData.orderItems[i],
          orderId: order.id,
          productId: products[i].id,
          sellerId: products[i].sellerId,
        };
        await OrderItem.create(orderItemData);
      }
    }

    logger.info('Seeding completed successfully!');
    logger.info(`Created:
      - ${users.length} users
      - ${sellers.length} sellers
      - ${deliveryPersons.length} delivery persons
      - ${salesmen.length} salesmen
      - ${products.length} products
      - ${beats.length} beats
      - ${stores.length} stores
      - ${seedData.orders.length} orders
      - ${seedData.orderItems.length} order items
    `);
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}

