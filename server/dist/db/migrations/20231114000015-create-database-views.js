// server/src/db/migrations/20231114000015-create-database-views.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a view for order summaries
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW order_summaries AS
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.delivery_status,
        o.total_amount,
        o.createdAt,
        u.first_name || ' ' || u.last_name as customer_name,
        u.email as customer_email,
        s.business_name as seller_name,
        dp.first_name || ' ' || dp.last_name as delivery_person_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN sellers s ON o.seller_id = s.id
      LEFT JOIN delivery_persons dp ON o.delivery_person_id = dp.id
      WHERE o.deleted_at IS NULL;
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
        p.is_active,
        s.business_name as seller_name,
        s.id as seller_id,
        p.createdAt,
        p.updatedAt
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.deleted_at IS NULL;
    `);
        // Create a view for sales reports
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW sales_reports AS
      SELECT 
        DATE_TRUNC('day', o.createdAt) as sale_date,
        s.id as seller_id,
        s.business_name as seller_name,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.quantity) as total_items_sold,
        SUM(oi.price * oi.quantity) as total_sales_amount,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN sellers s ON o.seller_id = s.id
      WHERE o.status NOT IN ('cancelled', 'refunded')
      GROUP BY DATE_TRUNC('day', o.createdAt), s.id, s.business_name
      ORDER BY sale_date DESC;
    `);
    },
    down: async (queryInterface, Sequelize) => {
        // Drop views
        await queryInterface.sequelize.query('DROP VIEW IF EXISTS order_summaries');
        await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_inventory');
        await queryInterface.sequelize.query('DROP VIEW IF EXISTS sales_reports');
    },
};
