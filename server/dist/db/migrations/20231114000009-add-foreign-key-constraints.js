// server/src/db/migrations/20231114000009-add-foreign-key-constraints.ts
'use strict';
const sequelize_1 = require("sequelize");
const migration = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Helper function to safely add constraints
            const addConstraintIfNotExists = async (tableName, constraintName, fields, referencedTable, onDelete = 'CASCADE', onUpdate = 'CASCADE', t) => {
                const [results] = await queryInterface.sequelize.query(`SELECT constraint_name 
           FROM information_schema.table_constraints 
           WHERE constraint_name = '${constraintName}' 
           AND table_name = '${tableName}' 
           AND constraint_schema = DATABASE()`, {
                    type: sequelize_1.QueryTypes.SELECT,
                    transaction: t
                });
                if (!results) {
                    await queryInterface.addConstraint(tableName, {
                        fields,
                        type: 'foreign key',
                        name: constraintName,
                        references: {
                            table: referencedTable,
                            field: 'id',
                        },
                        onDelete,
                        onUpdate,
                        transaction: t
                    });
                }
            };
            // Add constraints one by one to avoid deadlocks
            await addConstraintIfNotExists('sellers', 'sellers_userId_fk', ['userId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('delivery_persons', 'delivery_persons_userId_fk', ['userId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('salesmen', 'salesmen_userId_fk', ['userId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('salesmen', 'salesmen_managerId_fk', ['managerId'], 'users', 'SET NULL', 'CASCADE', transaction);
            await addConstraintIfNotExists('products', 'products_sellerId_fk', ['sellerId'], 'sellers', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('orders', 'orders_userId_fk', ['userId'], 'users', 'RESTRICT', 'CASCADE', transaction);
            await addConstraintIfNotExists('orders', 'orders_sellerId_fk', ['sellerId'], 'sellers', 'RESTRICT', 'CASCADE', transaction);
            await addConstraintIfNotExists('orders', 'orders_deliveryPersonId_fk', ['deliveryPersonId'], 'delivery_persons', 'SET NULL', 'CASCADE', transaction);
            await addConstraintIfNotExists('order_items', 'order_items_orderId_fk', ['orderId'], 'orders', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('order_items', 'order_items_productId_fk', ['productId'], 'products', 'RESTRICT', 'CASCADE', transaction);
            await addConstraintIfNotExists('order_items', 'order_items_sellerId_fk', ['sellerId'], 'sellers', 'RESTRICT', 'CASCADE', transaction);
            await addConstraintIfNotExists('beats', 'beats_salesmanId_fk', ['salesmanId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('visits', 'visits_beatId_fk', ['beatId'], 'beats', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('visits', 'visits_salesmanId_fk', ['salesmanId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('visits', 'visits_storeId_fk', ['storeId'], 'stores', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('complaints', 'complaints_userId_fk', ['userId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('complaints', 'complaints_orderId_fk', ['orderId'], 'orders', 'SET NULL', 'CASCADE', transaction);
            await addConstraintIfNotExists('complaints', 'complaints_resolvedBy_fk', ['resolvedBy'], 'users', 'SET NULL', 'CASCADE', transaction);
            await addConstraintIfNotExists('attachments', 'attachments_complaintId_fk', ['complaintId'], 'complaints', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('attachments', 'attachments_orderId_fk', ['orderId'], 'orders', 'CASCADE', 'CASCADE', transaction);
            await addConstraintIfNotExists('attachments', 'attachments_userId_fk', ['userId'], 'users', 'CASCADE', 'CASCADE', transaction);
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            console.error('Migration failed:', error);
            throw error;
        }
    },
    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
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
                    const tableName = constraint.split('_')[0];
                    await queryInterface.removeConstraint(tableName.endsWith('s') ? tableName : `${tableName}s`, constraint, { transaction });
                }
                catch (error) {
                    console.warn(`Failed to remove constraint ${constraint}:`, error instanceof Error ? error.message : 'Unknown error');
                }
            }
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            console.error('Migration rollback failed:', error);
            throw error;
        }
    },
};
module.exports = migration;
