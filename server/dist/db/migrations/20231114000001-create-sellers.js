// server/src/db/migrations/20231114000001-create-sellers.ts
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('sellers', {
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
            businessName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            businessDescription: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            businessAddress: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            businessPhone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            rating: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            totalRatings: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
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
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
        // Add indexes
        await queryInterface.addIndex('sellers', ['userId'], { unique: true });
        await queryInterface.addIndex('sellers', ['businessName']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sellers');
    },
};
