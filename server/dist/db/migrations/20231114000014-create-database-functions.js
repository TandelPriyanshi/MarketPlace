// server/src/db/migrations/20231114000014-create-database-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function for case-insensitive search
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION immutable_unaccent(text)
      RETURNS text AS
      $func$
      SELECT public.unaccent('public.unaccent', $1)
      $func$ LANGUAGE sql IMMUTABLE;
    `);
        // Create a function for generating order numbers
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION generate_order_number()
      RETURNS text AS $$
      DECLARE
        order_number text;
      BEGIN
        order_number := 'ORD-' || to_char(CURRENT_DATE, 'YYYYMMDD-') || 
                       lpad(floor(random() * 10000)::text, 4, '0');
        RETURN order_number;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create a function for calculating order total
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION calculate_order_total(order_id uuid)
      RETURNS decimal(10,2) AS $$
      DECLARE
        total_amount decimal(10,2);
      BEGIN
        SELECT COALESCE(SUM(price * quantity), 0)
        INTO total_amount
        FROM order_items
        WHERE order_id = $1;
        
        RETURN total_amount;
      END;
      $$ LANGUAGE plpgsql;
    `);
    },
    down: async (queryInterface, Sequelize) => {
        // Drop functions
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS immutable_unaccent(text)');
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS generate_order_number()');
        await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS calculate_order_total(uuid)');
    },
};
