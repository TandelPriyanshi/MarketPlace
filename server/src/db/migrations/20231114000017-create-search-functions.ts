// server/src/db/migrations/20231114000017-create-search-functions.ts
'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    // Drop the function if it exists
    await queryInterface.sequelize.query(`
      DROP PROCEDURE IF EXISTS search_products;
    `);

    // Create a stored procedure for product search using MySQL full-text search
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE search_products(IN search_query TEXT)
      BEGIN
        SET @search_query = search_query;
        
        -- Create a temporary table to store results
        DROP TEMPORARY TABLE IF EXISTS temp_search_results;
        CREATE TEMPORARY TABLE temp_search_results (
          id CHAR(36),
          name TEXT,
          description TEXT,
          category TEXT,
          brand TEXT,
          price DECIMAL(10,2),
          seller_name TEXT,
          relevance INT
        );
        
        -- Insert matching products with relevance score
        INSERT INTO temp_search_results
        SELECT 
          p.id,
          p.name,
          p.description,
          p.category,
          p.brand,
          p.price,
          s.businessName as seller_name,
          MATCH(p.name, p.description, p.category, p.brand) 
            AGAINST(@search_query IN NATURAL LANGUAGE MODE) as relevance
        FROM 
          products p
          JOIN sellers s ON p.sellerId = s.id
        WHERE 
          MATCH(p.name, p.description, p.category, p.brand) 
            AGAINST(@search_query IN NATURAL LANGUAGE MODE)
          AND p.isActive = TRUE
          AND p.deleted_at IS NULL
        ORDER BY relevance DESC;
        
        -- Return the results
        SELECT * FROM temp_search_results;
        
        -- Clean up
        DROP TEMPORARY TABLE IF EXISTS temp_search_results;
      END;
    `);

    // Drop the function if it exists
    await queryInterface.sequelize.query(`
      DROP PROCEDURE IF EXISTS search_orders;
    `);

    // Create a stored procedure for order search using MySQL full-text search
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE search_orders(IN search_query TEXT, IN user_id CHAR(36), IN user_role TEXT)
      BEGIN
        SET @search_query = search_query;
        SET @user_id = user_id;
        SET @user_role = user_role;
        
        -- Create a temporary table to store results
        DROP TEMPORARY TABLE IF EXISTS temp_search_results;
        CREATE TEMPORARY TABLE temp_search_results (
          id CHAR(36),
          order_number TEXT,
          status TEXT,
          total_amount DECIMAL(10,2),
          createdAt TIMESTAMP,
          customer_name TEXT,
          seller_name TEXT,
          relevance INT
        );
        
        -- Insert matching orders with relevance score
        INSERT INTO temp_search_results
        SELECT 
          o.id,
          o.order_number,
          o.status,
          o.total_amount,
          o.createdAt,
          u.firstName || ' ' || u.lastName as customer_name,
          s.businessName as seller_name,
          MATCH(o.order_number, o.status, u.firstName, u.lastName, s.businessName) 
            AGAINST(@search_query IN NATURAL LANGUAGE MODE) as relevance
        FROM 
          orders o
          JOIN users u ON o.userId = u.id
          JOIN sellers s ON o.sellerId = s.id
        WHERE 
          MATCH(o.order_number, o.status, u.firstName, u.lastName, s.businessName) 
            AGAINST(@search_query IN NATURAL LANGUAGE MODE)
          AND o.deleted_at IS NULL
        ORDER BY relevance DESC;
        
        -- Filter results based on user role
        IF @user_role = 'admin' THEN
          SELECT * FROM temp_search_results;
        ELSEIF @user_role = 'seller' THEN
          SELECT * FROM temp_search_results WHERE sellerId = @user_id;
        ELSEIF @user_role = 'customer' THEN
          SELECT * FROM temp_search_results WHERE userId = @user_id;
        ELSEIF @user_role = 'delivery_person' THEN
          SELECT * FROM temp_search_results WHERE deliveryPersonId = @user_id;
        END IF;
        
        -- Clean up
        DROP TEMPORARY TABLE IF EXISTS temp_search_results;
      END;
    `);
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS search_products;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS search_orders;');
  },
};