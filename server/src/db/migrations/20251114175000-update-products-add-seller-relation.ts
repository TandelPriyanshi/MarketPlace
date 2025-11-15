import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Check if column exists first
    const [results] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'seller_id';
    `);

    // Add seller_id column if it doesn't exist
    if (results.length === 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN seller_id CHAR(36) AFTER id;
      `);
    }

    // Check if index exists
    const [indexResults] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM products WHERE Key_name = 'idx_products_seller_id';
    `);

    // Add index if it doesn't exist
    if (indexResults.length === 0) {
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_products_seller_id ON products(seller_id);
      `);
    }

    // Add foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE products 
      DROP FOREIGN KEY IF EXISTS fk_products_seller_id;
      
      ALTER TABLE products 
      ADD CONSTRAINT fk_products_seller_id
      FOREIGN KEY (seller_id) 
      REFERENCES sellers(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
  },

  async down(queryInterface: QueryInterface) {
    // Remove foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE products 
      DROP FOREIGN KEY IF EXISTS fk_products_seller_id;
    `);

    // Remove index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_products_seller_id ON products;
    `);

    // Remove column
    await queryInterface.sequelize.query(`
      ALTER TABLE products 
      DROP COLUMN IF EXISTS seller_id;
    `);
  }
};
