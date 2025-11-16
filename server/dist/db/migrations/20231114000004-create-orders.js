// server/src/db/migrations/20231114000004-create-orders.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.UUID,
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            sellerId: {
                type: Sequelize.UUID,
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                allowNull: false,
                references: {
                    model: 'sellers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            deliveryPersonId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'delivery_persons',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            orderNumber: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            totalAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
                },
            },
            deliveryStatus: {
                type: Sequelize.ENUM('pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'returned', 'cancelled'),
                defaultValue: 'pending',
            },
            paymentStatus: {
                type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
                defaultValue: 'pending',
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'),
                defaultValue: 'pending',
            },
            isCancelled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            shippingAddress: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            billingAddress: {
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
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
        await queryInterface.createTable('order_items', {
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
            },
            sellerId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'sellers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                },
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
                },
            },
            discount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                validate: {
                    min: 0,
                },
            },
            total: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    min: 0.01,
                },
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
        await queryInterface.addIndex('orders', ['userId']);
        await queryInterface.addIndex('orders', ['sellerId']);
        await queryInterface.addIndex('orders', ['deliveryPersonId']);
        await queryInterface.addIndex('orders', ['orderNumber'], { unique: true });
        await queryInterface.addIndex('orders', ['status']);
        await queryInterface.addIndex('orders', ['paymentStatus']);
        await queryInterface.addIndex('orders', ['deliveryStatus']);
        await queryInterface.addIndex('order_items', ['orderId']);
        await queryInterface.addIndex('order_items', ['productId']);
        await queryInterface.addIndex('order_items', ['sellerId']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
    },
};
