"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    async up(queryInterface) {
        // Check if columns exist before adding them
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
        const [isActiveResult] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_active'
    `);
        // Add created_at column if it doesn't exist
        if (created_atResult.length === 0) {
            await queryInterface.addColumn('users', 'created_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true, // Allow null initially to handle existing data
            });
            // Update existing rows to have current timestamp
            await queryInterface.sequelize.query(`
        UPDATE users SET created_at = NOW() WHERE created_at IS NULL
      `);
            // Now make it NOT NULL
            await queryInterface.changeColumn('users', 'created_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            });
        }
        // Add updated_at column if it doesn't exist
        if (updatedAtResult.length === 0) {
            await queryInterface.addColumn('users', 'updated_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true, // Allow null initially to handle existing data
            });
            // Update existing rows to have current timestamp
            await queryInterface.sequelize.query(`
        UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL
      `);
            // Now make it NOT NULL
            await queryInterface.changeColumn('users', 'updated_at', {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            });
        }
        // Add is_active column if it doesn't exist
        if (isActiveResult.length === 0) {
            await queryInterface.addColumn('users', 'is_active', {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            });
        }
    },
    async down(queryInterface) {
        // Remove columns (optional - be careful with this in production)
        await queryInterface.removeColumn('users', 'created_at');
        await queryInterface.removeColumn('users', 'updated_at');
        await queryInterface.removeColumn('users', 'is_active');
    }
};
