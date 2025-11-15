import { QueryInterface, DataTypes } from 'sequelize';

// Using CommonJS exports for Sequelize CLI compatibility
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    // Check if the column exists first
    const [results] = await queryInterface.sequelize.query(
      `SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'attachments' 
       AND COLUMN_NAME = 'metadata'`
    );

    // If the column exists, drop it
    if (results.length > 0) {
      await queryInterface.removeColumn('attachments', 'metadata');
    }

    // Add the column with the correct type for MySQL
    await queryInterface.addColumn('attachments', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('attachments', 'metadata');
  }
};
