// server/src/db/migrations/20231114000003-create-products.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('products', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            sellerId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'sellers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
                },
            },
            stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0,
                },
            },
            sku: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            brand: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            images: {
                type: Sequelize.JSON,
                defaultValue: [],
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
        // Add indexes
        await queryInterface.addIndex('products', ['sellerId']);
        await queryInterface.addIndex('products', ['category']);
        await queryInterface.addIndex('products', ['brand']);
        await queryInterface.addIndex('products', ['isActive']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('products');
    },
};
