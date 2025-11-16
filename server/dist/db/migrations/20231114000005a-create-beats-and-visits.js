// server/src/db/migrations/20231114000005-create-beats-and-visits.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('beats', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            salesmanId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            area: {
                type: Sequelize.JSON, // Store polygon coordinates as JSON array
                allowNull: true,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
        await queryInterface.createTable('visits', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            beatId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'beats',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            salesmanId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            storeId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            visitDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            status: {
                type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
                defaultValue: 'scheduled',
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
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
        });
        // Add indexes
        await queryInterface.addIndex('beats', ['salesmanId']);
        await queryInterface.addIndex('beats', ['isActive']);
        await queryInterface.addIndex('visits', ['beatId']);
        await queryInterface.addIndex('visits', ['salesmanId']);
        await queryInterface.addIndex('visits', ['storeId']);
        await queryInterface.addIndex('visits', ['visitDate']);
        await queryInterface.addIndex('visits', ['status']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('visits');
        await queryInterface.dropTable('beats');
    },
};
