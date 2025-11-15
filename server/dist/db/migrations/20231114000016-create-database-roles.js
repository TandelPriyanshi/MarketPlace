// server/src/db/migrations/20231114000016-create-database-roles.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create roles if they don't exist
        await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marketplace_admin') THEN
          CREATE ROLE marketplace_admin WITH NOLOGIN;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marketplace_seller') THEN
          CREATE ROLE marketplace_seller WITH NOLOGIN;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marketplace_customer') THEN
          CREATE ROLE marketplace_customer WITH NOLOGIN;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marketplace_delivery') THEN
          CREATE ROLE marketplace_delivery WITH NOLOGIN;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'marketplace_salesman') THEN
          CREATE ROLE marketplace_salesman WITH NOLOGIN;
        END IF;
      END
      $$;
    `);
        // Grant schema usage
        await queryInterface.sequelize.query(`
      GRANT USAGE ON SCHEMA public TO marketplace_admin, marketplace_seller, 
      marketplace_customer, marketplace_delivery, marketplace_salesman;
    `);
        // Grant table permissions
        await queryInterface.sequelize.query(`
      -- Admin has full access to all tables
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marketplace_admin;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marketplace_admin;
      
      -- Sellers can manage their products and orders
      GRANT SELECT, INSERT, UPDATE ON products TO marketplace_seller;
      GRANT SELECT, UPDATE ON orders TO marketplace_seller;
      GRANT SELECT, INSERT, UPDATE ON order_items TO marketplace_seller;
      
      -- Customers can view products and manage their orders
      GRANT SELECT ON products TO marketplace_customer;
      GRANT SELECT, INSERT, UPDATE ON orders TO marketplace_customer;
      GRANT SELECT ON order_items TO marketplace_customer;
      
      -- Delivery persons can update order status
      GRANT SELECT, UPDATE (delivery_status, updated_at) ON orders TO marketplace_delivery;
      GRANT SELECT ON order_items TO marketplace_delivery;
      
      -- Salesmen can manage beats and visits
      GRANT SELECT, INSERT, UPDATE ON beats TO marketplace_salesman;
      GRANT SELECT, INSERT, UPDATE ON visits TO marketplace_salesman;
      GRANT SELECT ON stores TO marketplace_salesman;
    `);
        // Set default privileges for future tables
        await queryInterface.sequelize.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT ALL PRIVILEGES ON TABLES TO marketplace_admin;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE ON TABLES TO marketplace_seller;
      
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT ON TABLES TO marketplace_customer;
    `);
    },
    down: async (queryInterface, Sequelize) => {
        // Revoke privileges
        await queryInterface.sequelize.query(`
      REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM 
      marketplace_admin, marketplace_seller, marketplace_customer, 
      marketplace_delivery, marketplace_salesman;
      
      REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM 
      marketplace_admin, marketplace_seller, marketplace_customer, 
      marketplace_delivery, marketplace_salesman;
      
      REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM 
      marketplace_admin, marketplace_seller, marketplace_customer, 
      marketplace_delivery, marketplace_salesman;
    `);
        // Drop roles
        await queryInterface.sequelize.query(`
      DROP ROLE IF EXISTS marketplace_admin;
      DROP ROLE IF EXISTS marketplace_seller;
      DROP ROLE IF EXISTS marketplace_customer;
      DROP ROLE IF EXISTS marketplace_delivery;
      DROP ROLE IF EXISTS marketplace_salesman;
    `);
    },
};
