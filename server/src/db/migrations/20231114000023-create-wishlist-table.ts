// server/src/db/migrations/20231114000023-create-wishlist-table.js
'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('wishlists', ['userId']);
    await queryInterface.addIndex('wishlists', ['productId']);

    // Add unique constraint to ensure a product can only be in a user's wishlist once
    await queryInterface.addConstraint('wishlists', {
      fields: ['userId', 'productId'],
      type: 'unique',
      name: 'wishlists_userId_productId_unique',
    });
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('wishlists');
  },
};