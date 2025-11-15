// server/src/db/migrations/20231114000010-add-indexes-and-constraints.ts
'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    // Add composite indexes with existence check
    const tableNames = ['orders', 'order_items', 'visits'];
    const existingIndexes = await Promise.all(
      tableNames.map(tableName => 
        queryInterface.showIndex(tableName)
      )
    );

    // Add orders index if it doesn't exist
    if (!existingIndexes[0].some((index: any) => index.name === 'orders_status_payment_delivery_idx')) {
      await queryInterface.addIndex('orders', ['status', 'paymentStatus', 'deliveryStatus'], {
        name: 'orders_status_payment_delivery_idx',
      });
    }

    // Add order_items index if it doesn't exist
    if (!existingIndexes[1].some((index: any) => index.name === 'order_items_orderId_productId_idx')) {
      await queryInterface.addIndex('order_items', ['orderId', 'productId'], {
        name: 'order_items_orderId_productId_idx',
      });
    }

    // Add visits index if it doesn't exist
    if (!existingIndexes[2].some((index: any) => index.name === 'visits_salesman_status_date_idx')) {
      await queryInterface.addIndex('visits', ['salesmanId', 'status', 'visitDate'], {
        name: 'visits_salesman_status_date_idx',
      });
    }

    // Add unique constraints with existence check
    const checkConstraintExists = async (tableName: string, constraintName: string) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = '${tableName}' 
         AND CONSTRAINT_NAME = '${constraintName}'`
      );
      return Array.isArray(results) && results.length > 0;
    };

    // Add check constraint if it doesn't exist
    const addCheckConstraint = async (tableName: string, constraintName: string, check: string) => {
      if (!(await checkConstraintExists(tableName, constraintName))) {
        await queryInterface.sequelize.query(`
          ALTER TABLE ${tableName}
          ADD CONSTRAINT ${constraintName}
          CHECK (${check});
        `);
      }
    };

    // Add unique constraints if they don't exist
    if (!(await checkConstraintExists('sellers', 'sellers_userId_unique'))) {
      await queryInterface.addConstraint('sellers', {
        fields: ['userId'],
        type: 'unique',
        name: 'sellers_userId_unique',
      });
    }

    if (!(await checkConstraintExists('delivery_persons', 'delivery_persons_userId_unique'))) {
      await queryInterface.addConstraint('delivery_persons', {
        fields: ['userId'],
        type: 'unique',
        name: 'delivery_persons_userId_unique',
      });
    }

    // Add check constraints if they don't exist
    await addCheckConstraint('products', 'products_price_check', 'price > 0');
    await addCheckConstraint('orders', 'orders_total_amount_check', 'totalAmount > 0');
    await addCheckConstraint('order_items', 'order_items_quantity_check', 'quantity > 0');
    await addCheckConstraint('order_items', 'order_items_price_check', 'price > 0');
  },

  down: async (queryInterface: any, Sequelize: any) => {
    // Remove indexes if they exist
    try {
      await queryInterface.removeIndex('orders', 'orders_status_payment_delivery_idx');
    } catch (error) {
      console.warn('Index orders_status_payment_delivery_idx does not exist');
    }

    try {
      await queryInterface.removeIndex('order_items', 'order_items_orderId_productId_idx');
    } catch (error) {
      console.warn('Index order_items_orderId_productId_idx does not exist');
    }

    try {
      await queryInterface.removeIndex('visits', 'visits_salesman_status_date_idx');
    } catch (error) {
      console.warn('Index visits_salesman_status_date_idx does not exist');
    }

    // Remove unique constraints if they exist
    try {
      await queryInterface.removeConstraint('sellers', 'sellers_userId_unique');
    } catch (error) {
      console.warn('Constraint sellers_userId_unique does not exist');
    }

    try {
      await queryInterface.removeConstraint('delivery_persons', 'delivery_persons_userId_unique');
    } catch (error) {
      console.warn('Constraint delivery_persons_userId_unique does not exist');
    }

    // Remove check constraints if they exist
    const dropCheckConstraint = async (tableName: string, constraintName: string) => {
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE ${tableName}
          DROP CONSTRAINT IF EXISTS ${constraintName};
        `);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Failed to drop ${constraintName}:`, errorMessage);
      }
    };

    await dropCheckConstraint('products', 'products_price_check');
    await dropCheckConstraint('orders', 'orders_total_amount_check');
    await dropCheckConstraint('order_items', 'order_items_quantity_check');
    await dropCheckConstraint('order_items', 'order_items_price_check');
  },
};