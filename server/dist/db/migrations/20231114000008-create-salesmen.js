// server/src/db/migrations/20231114000008-create-salesmen.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('salesmen', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            employeeId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            joiningDate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            department: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            designation: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            managerId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
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
        // Add indexes
        await queryInterface.addIndex('salesmen', ['userId'], { unique: true });
        await queryInterface.addIndex('salesmen', ['employeeId'], { unique: true });
        await queryInterface.addIndex('salesmen', ['managerId']);
        await queryInterface.addIndex('salesmen', ['isActive']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('salesmen');
    },
};
