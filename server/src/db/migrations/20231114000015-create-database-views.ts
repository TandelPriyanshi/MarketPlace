// server/src/db/migrations/20231114000015-create-database-views.ts
'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    try {
      // Create a view for order summaries
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW order_summaries AS
        SELECT 
          o.id,
          o.orderNumber as order_number,
          o.status,
          o.paymentStatus as payment_status,
          o.deliveryStatus as delivery_status,
          o.totalAmount as total_amount,
          o.createdAt as createdAt,
          CONCAT(u.firstName, ' ', u.lastName) as customer_name,
          u.email as customer_email,
          s.businessName as seller_name,
          CONCAT(du.firstName, ' ', du.lastName) as delivery_person_name
        FROM orders o
        JOIN users u ON o.userId = u.id
        JOIN sellers s ON o.sellerId = s.id
        LEFT JOIN delivery_persons dp ON o.deliveryPersonId = dp.id
        LEFT JOIN users du ON dp.userId = du.id
        WHERE o.deletedAt IS NULL;
      `);

      // Create a view for product inventory
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW product_inventory AS
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.price,
          p.stock,
          p.isActive as is_active,
          s.businessName as seller_name,
          s.id as seller_id,
          p.createdAt as createdAt,
          p.updatedAt as updated_at
        FROM products p
        JOIN sellers s ON p.sellerId = s.id
        WHERE p.deletedAt IS NULL;
      `);

      // Create a view for sales reports
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW sales_reports AS
        SELECT 
          DATE(o.createdAt) as sale_date,
          s.id as seller_id,
          s.businessName as seller_name,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(oi.quantity), 0) as total_items_sold,
          COALESCE(SUM(oi.price * oi.quantity), 0) as total_sales_amount,
          COUNT(DISTINCT o.userId) as unique_customers
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.orderId
        JOIN sellers s ON o.sellerId = s.id
        WHERE o.status NOT IN ('cancelled', 'refunded')
        GROUP BY DATE(o.createdAt), s.id, s.businessName
        ORDER BY sale_date DESC;
      `);
    } catch (error) {
      console.error('Error creating database views:', error);
      throw error;
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    try {
      // Drop views in reverse order of creation to handle dependencies
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS sales_reports');
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_inventory');
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS order_summaries');
    } catch (error) {
      console.error('Error dropping database views:', error);
      throw error;
    }
  },
};