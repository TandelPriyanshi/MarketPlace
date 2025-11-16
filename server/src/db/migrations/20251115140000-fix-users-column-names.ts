import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Check if camelCase columns exist
    const [created_atResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'created_at'
    `);

    const [updatedAtResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'updatedAt'
    `);

    // If camelCase columns exist, rename them to snake_case
    if (created_atResult.length > 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE users CHANGE COLUMN created_at created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
    }

    if (updatedAtResult.length > 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE users CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }

    // Check if is_active column exists, if not add it
    const [isActiveResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_active'
    `);

    if (isActiveResult.length === 0) {
      await queryInterface.addColumn('users', 'is_active', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface: QueryInterface) {
    // Revert back to camelCase if needed
    const [created_atResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'created_at'
    `);

    const [updatedAtResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'updated_at'
    `);

    if (created_atResult.length > 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE users CHANGE COLUMN created_at created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
    }

    if (updatedAtResult.length > 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE users CHANGE COLUMN updated_at updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
  }
};
