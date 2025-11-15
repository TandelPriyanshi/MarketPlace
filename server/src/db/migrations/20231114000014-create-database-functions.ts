// server/src/db/migrations/20231114000014-create-database-functions.ts
'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    // MySQL-compatible function creation without DELIMITER
    try {
      // Create a function for generating order numbers (MySQL version)
      await queryInterface.sequelize.query(`
        CREATE FUNCTION IF NOT EXISTS generate_order_number() 
        RETURNS VARCHAR(20) DETERMINISTIC
        RETURN CONCAT(
          'ORD-', 
          DATE_FORMAT(NOW(), '%Y%m%d-'),
          LPAD(FLOOR(RAND() * 10000), 4, '0')
        )
      `);

      // Create a function for calculating order total (MySQL version)
      await queryInterface.sequelize.query(`
        CREATE FUNCTION IF NOT EXISTS calculate_order_total(order_id_param VARCHAR(36))
        RETURNS DECIMAL(10,2) DETERMINISTIC
        RETURN (
          SELECT IFNULL(SUM(price * quantity), 0)
          FROM order_items
          WHERE order_id = order_id_param
        )
      `);
    } catch (error) {
      console.error('Error creating database functions:', error);
      throw error;
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    try {
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS generate_order_number');
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS calculate_order_total');
    } catch (error) {
      console.error('Error dropping database functions:', error);
      throw error;
    }
  },
};