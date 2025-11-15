// server/src/db/migrations/20231114000018-create-analytics-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function for sales analytics
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION get_sales_analytics(
        start_date timestamp with time zone,
        end_date timestamp with time zone,
        group_by text DEFAULT 'day'
      )
      RETURNS TABLE (
        period text,
        total_orders bigint,
        total_sales decimal(10,2),
        average_order_value decimal(10,2)
      ) AS $$
      BEGIN
        RETURN QUERY
        WITH sales_data AS (
          SELECT
            CASE 
              WHEN group_by = 'hour' THEN to_char(o.createdAt, 'YYYY-MM-DD HH24:00')
              WHEN group_by = 'day' THEN to_char(o.createdAt, 'YYYY-MM-DD')
              WHEN group_by = 'week' THEN to_char(date_trunc('week', o.createdAt), 'YYYY-MM-DD') || ' to ' || 
                                         to_char(date_trunc('week', o.createdAt) + interval '6 days', 'YYYY-MM-DD')
              WHEN group_by = 'month' THEN to_char(o.createdAt, 'YYYY-MM')
              WHEN group_by = 'year' THEN to_char(o.createdAt, 'YYYY')
              ELSE to_char(o.createdAt, 'YYYY-MM-DD')
            END as period,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_sales
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.createdAt BETWEEN start_date AND end_date
          GROUP BY 
            period
          ORDER BY 
            period
        )
        SELECT
          period::text,
          total_orders,
          total_sales,
          CASE 
            WHEN total_orders > 0 THEN ROUND(total_sales / total_orders, 2)
            ELSE 0 
          END as average_order_value
        FROM 
          sales_data;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create a function for product performance
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION get_product_performance(
        start_date timestamp with time zone,
        end_date timestamp with time zone,
        limit_count int DEFAULT 10
      )
      RETURNS TABLE (
        product_id uuid,
        product_name text,
        category text,
        total_quantity_sold bigint,
        total_revenue decimal(10,2),
        average_rating numeric(3,2)
      ) AS $$
      BEGIN
        RETURN QUERY
        WITH product_sales AS (
          SELECT
            p.id as product_id,
            p.name as product_name,
            p.category,
            COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
            COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
          FROM 
            products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.createdAt BETWEEN start_date AND end_date
          GROUP BY 
            p.id, p.name, p.category
        ),
        product_ratings AS (
          SELECT
            p.id as product_id,
            ROUND(AVG(r.rating)::numeric, 2) as average_rating
          FROM 
            products p
            LEFT JOIN reviews r ON p.id = r.product_id
          GROUP BY 
            p.id
        )
        SELECT
          ps.product_id,
          ps.product_name,
          ps.category,
          ps.total_quantity_sold,
          ps.total_revenue,
          pr.average_rating
        FROM 
          product_sales ps
          LEFT JOIN product_ratings pr ON ps.product_id = pr.product_id
        ORDER BY 
          ps.total_revenue DESC
        LIMIT 
          limit_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS get_sales_analytics(timestamp with time zone, timestamp with time zone, text)');
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS get_product_performance(timestamp with time zone, timestamp with time zone, integer)');
    },
};
