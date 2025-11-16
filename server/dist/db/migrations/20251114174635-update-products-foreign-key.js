"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    async up(queryInterface) {
        // First, check if seller_id column exists and add it if it doesn't
        const [results] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'seller_id'
    `);
        if (results.length === 0) {
            await queryInterface.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN seller_id CHAR(36) AFTER id,
        ADD INDEX idx_products_seller_id (seller_id);
      `);
        }
        // Then, add the foreign key constraint
        await queryInterface.sequelize.query(`
      ALTER TABLE products 
      ADD CONSTRAINT fk_products_seller_id
      FOREIGN KEY (seller_id) 
      REFERENCES sellers(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
    },
    async down(queryInterface) {
        // First, remove the foreign key constraint
        await queryInterface.sequelize.query(`
      ALTER TABLE products 
      DROP FOREIGN KEY IF EXISTS fk_products_seller_id;
    `);
        // Then, remove the seller_id column
        await queryInterface.sequelize.query(`
      ALTER TABLE products 
      DROP COLUMN IF EXISTS seller_id;
    `);
    }
};
