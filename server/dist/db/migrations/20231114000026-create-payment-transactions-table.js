// server/src/db/migrations/20231114000026-create-payment-transactions-table.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payment_transactions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            orderId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
                },
            },
            currency: {
                type: Sequelize.STRING(3),
                defaultValue: 'INR',
                allowNull: false,
            },
            paymentMethod: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            paymentGateway: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            gatewayTransactionId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('pending', 'processing', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'voided'),
                defaultValue: 'pending',
                allowNull: false,
            },
            gatewayResponse: {
                type: Sequelize.JSON,
                allowNull: true,
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
        });
        // Add indexes
        await queryInterface.addIndex('payment_transactions', ['orderId']);
        await queryInterface.addIndex('payment_transactions', ['userId']);
        await queryInterface.addIndex('payment_transactions', ['status']);
        await queryInterface.addIndex('payment_transactions', ['paymentGateway']);
        await queryInterface.addIndex('payment_transactions', ['gatewayTransactionId'], {
            where: { gatewayTransactionId: { [Sequelize.Op.ne]: null } },
            unique: true
        });
        await queryInterface.addIndex('payment_transactions', ['createdAt']);
        // Add check constraint for positive amount
        await queryInterface.sequelize.query(`
      ALTER TABLE payment_transactions
      ADD CONSTRAINT payment_transactions_amount_check
      CHECK (amount > 0);
    `);
    },
    down: async (queryInterface, Sequelize) => {
        // Remove check constraint first
        try {
            await queryInterface.sequelize.query(`
        ALTER TABLE payment_transactions
        DROP CONSTRAINT IF EXISTS payment_transactions_amount_check;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop payment_transactions_amount_check:', errorMessage);
        }
        // Drop the table
        await queryInterface.dropTable('payment_transactions');
    },
};
