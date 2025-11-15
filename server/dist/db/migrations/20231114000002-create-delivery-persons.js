// server/src/db/migrations/20231114000002-create-delivery-persons.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('delivery_persons', {
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
            vehicleType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            vehicleNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            licenseNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'on_leave', 'suspended'),
                defaultValue: 'active',
            },
            rating: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            totalDeliveries: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            totalEarnings: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
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
        await queryInterface.addIndex('delivery_persons', ['userId'], { unique: true });
        await queryInterface.addIndex('delivery_persons', ['status']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('delivery_persons');
    },
};
