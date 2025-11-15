// server/src/db/migrations/20231114000010-add-indexes-and-constraints.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add composite indexes
        await queryInterface.addIndex('orders', ['status', 'paymentStatus', 'deliveryStatus'], {
            name: 'orders_status_composite_idx',
        });
        await queryInterface.addIndex('order_items', ['orderId', 'productId'], {
            name: 'order_items_composite_idx',
        });
        await queryInterface.addIndex('visits', ['salesmanId', 'status', 'visitDate'], {
            name: 'visits_salesman_status_date_idx',
        });
        // Add unique constraints
        await queryInterface.addConstraint('sellers', {
            fields: ['userId'],
            type: 'unique',
            name: 'sellers_userId_unique',
        });
        await queryInterface.addConstraint('delivery_persons', {
            fields: ['userId'],
            type: 'unique',
            name: 'delivery_persons_userId_unique',
        });
        // Add check constraints
        await queryInterface.sequelize.query(`
      ALTER TABLE products
      ADD CONSTRAINT products_price_check
      CHECK (price > 0);
    `);
        await queryInterface.sequelize.query(`
      ALTER TABLE orders
      ADD CONSTRAINT orders_total_amount_check
      CHECK (total_amount > 0);
    `);
        await queryInterface.sequelize.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT order_items_quantity_check
      CHECK (quantity > 0);
    `);
        await queryInterface.sequelize.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT order_items_price_check
      CHECK (price > 0);
    `);
    },
    down: async (queryInterface, Sequelize) => {
        // Remove indexes
        await queryInterface.removeIndex('orders', 'orders_status_composite_idx');
        await queryInterface.removeIndex('order_items', 'order_items_composite_idx');
        await queryInterface.removeIndex('visits', 'visits_salesman_status_date_idx');
        // Remove unique constraints
        await queryInterface.removeConstraint('sellers', 'sellers_userId_unique');
        await queryInterface.removeConstraint('delivery_persons', 'delivery_persons_userId_unique');
        // Remove check constraints
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE products
        DROP CONSTRAINT IF EXISTS products_price_check;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop products_price_check:', errorMessage);
        }
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS orders_total_amount_check;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop orders_total_amount_check:', errorMessage);
        }
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE order_items
        DROP CONSTRAINT IF EXISTS order_items_quantity_check;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop order_items_quantity_check:', errorMessage);
        }
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE order_items
        DROP CONSTRAINT IF EXISTS order_items_price_check;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop order_items_price_check:', errorMessage);
        }
    },
};
