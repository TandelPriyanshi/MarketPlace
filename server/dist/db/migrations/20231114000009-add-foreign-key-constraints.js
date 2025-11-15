// server/src/db/migrations/20231114000009-add-foreign-key-constraints.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add foreign key constraints with proper onDelete and onUpdate actions
        await queryInterface.addConstraint('sellers', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'sellers_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('delivery_persons', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'delivery_persons_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('salesmen', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'salesmen_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('salesmen', {
            fields: ['managerId'],
            type: 'foreign key',
            name: 'salesmen_managerId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('products', {
            fields: ['sellerId'],
            type: 'foreign key',
            name: 'products_sellerId_fk',
            references: {
                table: 'sellers',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('orders', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'orders_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('orders', {
            fields: ['sellerId'],
            type: 'foreign key',
            name: 'orders_sellerId_fk',
            references: {
                table: 'sellers',
                field: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('orders', {
            fields: ['deliveryPersonId'],
            type: 'foreign key',
            name: 'orders_deliveryPersonId_fk',
            references: {
                table: 'delivery_persons',
                field: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('order_items', {
            fields: ['orderId'],
            type: 'foreign key',
            name: 'order_items_orderId_fk',
            references: {
                table: 'orders',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('order_items', {
            fields: ['productId'],
            type: 'foreign key',
            name: 'order_items_productId_fk',
            references: {
                table: 'products',
                field: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('order_items', {
            fields: ['sellerId'],
            type: 'foreign key',
            name: 'order_items_sellerId_fk',
            references: {
                table: 'sellers',
                field: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('beats', {
            fields: ['salesmanId'],
            type: 'foreign key',
            name: 'beats_salesmanId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('visits', {
            fields: ['beatId'],
            type: 'foreign key',
            name: 'visits_beatId_fk',
            references: {
                table: 'beats',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('visits', {
            fields: ['salesmanId'],
            type: 'foreign key',
            name: 'visits_salesmanId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('visits', {
            fields: ['storeId'],
            type: 'foreign key',
            name: 'visits_storeId_fk',
            references: {
                table: 'stores',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('complaints', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'complaints_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('complaints', {
            fields: ['orderId'],
            type: 'foreign key',
            name: 'complaints_orderId_fk',
            references: {
                table: 'orders',
                field: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('complaints', {
            fields: ['resolvedBy'],
            type: 'foreign key',
            name: 'complaints_resolvedBy_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('attachments', {
            fields: ['complaintId'],
            type: 'foreign key',
            name: 'attachments_complaintId_fk',
            references: {
                table: 'complaints',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('attachments', {
            fields: ['orderId'],
            type: 'foreign key',
            name: 'attachments_orderId_fk',
            references: {
                table: 'orders',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        await queryInterface.addConstraint('attachments', {
            fields: ['userId'],
            type: 'foreign key',
            name: 'attachments_userId_fk',
            references: {
                table: 'users',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },
    down: async (queryInterface, Sequelize) => {
        // Remove all foreign key constraints
        const constraints = [
            'sellers_userId_fk',
            'delivery_persons_userId_fk',
            'salesmen_userId_fk',
            'salesmen_managerId_fk',
            'products_sellerId_fk',
            'orders_userId_fk',
            'orders_sellerId_fk',
            'orders_deliveryPersonId_fk',
            'order_items_orderId_fk',
            'order_items_productId_fk',
            'order_items_sellerId_fk',
            'beats_salesmanId_fk',
            'visits_beatId_fk',
            'visits_salesmanId_fk',
            'visits_storeId_fk',
            'complaints_userId_fk',
            'complaints_orderId_fk',
            'complaints_resolvedBy_fk',
            'attachments_complaintId_fk',
            'attachments_orderId_fk',
            'attachments_userId_fk',
        ];
        for (const constraint of constraints) {
            try {
                await queryInterface.removeConstraint(constraint.includes('_') ? constraint.split('_')[0] + 's' : constraint, constraint);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to remove constraint ${constraint}:`, errorMessage);
            }
        }
    },
};
