// server/src/db/migrations/20231114000018-create-analytics-functions.ts
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Drop procedures if they exist
            await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS get_sales_analytics');
            await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS get_product_analytics');
            // Create the sales analytics procedure
            const salesProc = `
      CREATE PROCEDURE get_sales_analytics(
        IN p_start_date DATETIME,
        IN p_end_date DATETIME,
        IN p_group_by VARCHAR(10)
      )
      BEGIN
        -- Create a temporary table to store results
        DROP TEMPORARY TABLE IF EXISTS temp_sales_analytics;
        CREATE TEMPORARY TABLE temp_sales_analytics (
          period VARCHAR(50),
          total_orders BIGINT,
          total_sales DECIMAL(10,2),
          average_order_value DECIMAL(10,2)
        );

        -- Insert data based on the grouping
        IF p_group_by = 'hour' THEN
          INSERT INTO temp_sales_analytics
          SELECT
            DATE_FORMAT(o.created_at, '%Y-%m-%d %H:00:00') as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            DATE_FORMAT(o.created_at, '%Y-%m-%d %H:00:00')
          ORDER BY 
            period;
            
        ELSEIF p_group_by = 'day' THEN
          INSERT INTO temp_sales_analytics
          SELECT
            DATE(o.created_at) as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            DATE(o.created_at)
          ORDER BY 
            period;
            
        ELSEIF p_group_by = 'week' THEN
          INSERT INTO temp_sales_analytics
          SELECT
            CONCAT(
              DATE_FORMAT(DATE_SUB(o.created_at, INTERVAL WEEKDAY(o.created_at) DAY), '%Y-%m-%d'),
              ' to ',
              DATE_FORMAT(DATE_ADD(DATE_SUB(o.created_at, INTERVAL WEEKDAY(o.created_at) DAY), INTERVAL 6 DAY), '%Y-%m-%d')
            ) as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            YEARWEEK(o.created_at)
          ORDER BY 
            MIN(o.created_at);
            
        ELSEIF p_group_by = 'month' THEN
          INSERT INTO temp_sales_analytics
          SELECT
            DATE_FORMAT(o.created_at, '%Y-%m') as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            YEAR(o.created_at), MONTH(o.created_at)
          ORDER BY 
            period;
            
        ELSEIF p_group_by = 'year' THEN
          INSERT INTO temp_sales_analytics
          SELECT
            YEAR(o.created_at) as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            YEAR(o.created_at)
          ORDER BY 
            period;
            
        ELSE
          -- Default to daily grouping
          INSERT INTO temp_sales_analytics
          SELECT
            DATE(o.created_at) as period,
            COUNT(DISTINCT o.id) as total_orders,
            CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END as total_sales,
            CASE 
              WHEN COUNT(DISTINCT o.id) > 0 THEN ROUND(CASE WHEN SUM(o.totalAmount) IS NULL THEN 0 ELSE SUM(o.totalAmount) END / COUNT(DISTINCT o.id), 2)
              ELSE 0 
            END as average_order_value
          FROM 
            orders o
          WHERE 
            o.status NOT IN ('cancelled', 'refunded')
            AND o.created_at BETWEEN p_start_date AND p_end_date
          GROUP BY 
            DATE(o.created_at)
          ORDER BY 
            period;
        END IF;
        
        -- Return the results
        SELECT * FROM temp_sales_analytics;
        
        -- Clean up
        DROP TEMPORARY TABLE IF EXISTS temp_sales_analytics;
      END;
      `;
            // Create the product analytics procedure
            const productProc = `
      CREATE PROCEDURE get_product_analytics(
        IN p_start_date DATETIME,
        IN p_end_date DATETIME,
        IN p_limit INT
      )
      BEGIN
        -- Create a temporary table to store results
        DROP TEMPORARY TABLE IF EXISTS temp_product_analytics;
        CREATE TEMPORARY TABLE temp_product_analytics (
          product_id CHAR(36),
          product_name VARCHAR(255),
          category VARCHAR(100),
          total_quantity_sold INT,
          total_revenue DECIMAL(10,2),
          average_rating DECIMAL(3,2)
        );

        -- Get top selling products
        INSERT INTO temp_product_analytics
        SELECT
          p.id as product_id,
          p.name as product_name,
          p.category,
          CASE WHEN SUM(oi.quantity) IS NULL THEN 0 ELSE SUM(oi.quantity) END as total_quantity_sold,
          CASE WHEN SUM(oi.quantity * oi.price) IS NULL THEN 0 ELSE SUM(oi.quantity * oi.price) END as total_revenue,
          CASE WHEN (
            SELECT AVG(rating) 
            FROM reviews r 
            WHERE r.productId = p.id
            AND r.deletedAt IS NULL
          ) IS NULL THEN 0 ELSE (
            SELECT AVG(rating) 
            FROM reviews r 
            WHERE r.productId = p.id
            AND r.deletedAt IS NULL
          ) END as average_rating
        FROM
          products p
        JOIN
          order_items oi ON p.id = oi.productId
        JOIN
          orders o ON oi.orderId = o.id
        WHERE
          o.status NOT IN ('cancelled', 'refunded')
          AND o.created_at BETWEEN p_start_date AND p_end_date
        GROUP BY
          p.id, p.name, p.category
        ORDER BY
          total_revenue DESC
        LIMIT p_limit;

        -- Return the results
        SELECT * FROM temp_product_analytics;
        
        -- Clean up
        DROP TEMPORARY TABLE IF EXISTS temp_product_analytics;
      END;
      `;
            // Execute the procedures
            await queryInterface.sequelize.query(salesProc);
            await queryInterface.sequelize.query(productProc);
        }
        catch (error) {
            console.error('Error creating procedures:', error);
            throw error;
        }
    },
    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS get_sales_analytics');
            await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS get_product_analytics');
        }
        catch (error) {
            console.error('Error dropping procedures:', error);
            throw error;
        }
    }
};
