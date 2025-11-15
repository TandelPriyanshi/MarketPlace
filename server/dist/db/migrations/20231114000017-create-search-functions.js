// server/src/db/migrations/20231114000017-create-search-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function for product search
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION search_products(query text)
      RETURNS TABLE (
        id uuid,
        name text,
        description text,
        category text,
        brand text,
        price decimal(10,2),
        seller_name text,
        rank float
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.id,
          p.name,
          p.description,
          p.category,
          p.brand,
          p.price,
          s.business_name as seller_name,
          ts_rank(
            to_tsvector('english', 
              COALESCE(p.name, '') || ' ' || 
              COALESCE(p.description, '') || ' ' || 
              COALESCE(p.category, '') || ' ' || 
              COALESCE(p.brand, '') || ' ' || 
              COALESCE(s.business_name, '')
            ),
            plainto_tsquery('english', query)
          ) as rank
        FROM 
          products p
          JOIN sellers s ON p.seller_id = s.id
        WHERE 
          to_tsvector('english', 
            COALESCE(p.name, '') || ' ' || 
            COALESCE(p.description, '') || ' ' || 
            COALESCE(p.category, '') || ' ' || 
            COALESCE(p.brand, '') || ' ' || 
            COALESCE(s.business_name, '')
          ) @@ plainto_tsquery('english', query)
          AND p.is_active = true
          AND p.deleted_at IS NULL
        ORDER BY 
          rank DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create a function for order search
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION search_orders(query text, user_id uuid, user_role text)
      RETURNS TABLE (
        id uuid,
        order_number text,
        status text,
        total_amount decimal(10,2),
        createdAt timestamp with time zone,
        customer_name text,
        seller_name text,
        rank float
      ) AS $$
      BEGIN
        RETURN QUERY
        WITH order_search AS (
          SELECT 
            o.id,
            o.order_number,
            o.status,
            o.total_amount,
            o.createdAt,
            u.first_name || ' ' || u.last_name as customer_name,
            s.business_name as seller_name,
            ts_rank(
              to_tsvector('english', 
                COALESCE(o.order_number, '') || ' ' || 
                COALESCE(o.status, '') || ' ' || 
                COALESCE(u.first_name, '') || ' ' || 
                COALESCE(u.last_name, '') || ' ' || 
                COALESCE(s.business_name, '')
              ),
              plainto_tsquery('english', query)
            ) as rank
          FROM 
            orders o
            JOIN users u ON o.user_id = u.id
            JOIN sellers s ON o.seller_id = s.id
          WHERE 
            to_tsvector('english', 
              COALESCE(o.order_number, '') || ' ' || 
              COALESCE(o.status, '') || ' ' || 
              COALESCE(u.first_name, '') || ' ' || 
              COALESCE(u.last_name, '') || ' ' || 
              COALESCE(s.business_name, '')
            ) @@ plainto_tsquery('english', query)
            AND o.deleted_at IS NULL
        )
        SELECT 
          os.id,
          os.order_number,
          os.status,
          os.total_amount,
          os.createdAt,
          os.customer_name,
          os.seller_name,
          os.rank
        FROM 
          order_search os
          JOIN orders o ON os.id = o.id
        WHERE 
          -- Admin can see all orders
          (user_role = 'admin') OR
          -- Sellers can see their own orders
          (user_role = 'seller' AND o.seller_id = user_id) OR
          -- Customers can see their own orders
          (user_role = 'customer' AND o.user_id = user_id) OR
          -- Delivery persons can see orders assigned to them
          (user_role = 'delivery_person' AND o.delivery_person_id = user_id)
        ORDER BY 
          os.rank DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS search_products(text)');
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS search_orders(text, uuid, text)');
    },
};
