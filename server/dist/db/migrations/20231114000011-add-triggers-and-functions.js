// server/src/db/migrations/20231114000011-add-triggers-and-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create triggers for all tables with updated_at column
        const tables = [
            'users',
            'sellers',
            'delivery_persons',
            'salesmen',
            'products',
            'orders',
            'order_items',
            'beats',
            'stores',
            'visits',
            'complaints',
        ];
        // MySQL doesn't salesman CREATE OR REPLACE TRIGGER, so we'll drop and create
        for (const table of tables) {
            const triggerName = `${table}_before_update`;
            try {
                // Drop trigger if it exists
                await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS ${triggerName}`, { raw: true });
                // Create trigger to update updated_at
                await queryInterface.sequelize.query(`CREATE TRIGGER ${triggerName}
          BEFORE UPDATE ON \`${table}\`
          FOR EACH ROW
          SET NEW.updated_at = NOW();`, { raw: true });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to create trigger for ${table}:`, errorMessage);
            }
        }
        // Create trigger for order status changes
        try {
            // Drop trigger if it exists
            await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS orders_before_status_update', { raw: true });
            // Create trigger to handle order status changes
            await queryInterface.sequelize.query(`CREATE TRIGGER orders_before_status_update
        BEFORE UPDATE ON \`orders\`
        FOR EACH ROW
        BEGIN
          -- Update order status timestamp based on status
          IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
            SET NEW.delivered_at = NOW();
          ELSEIF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
            SET NEW.cancelled_at = NOW();
          ELSEIF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
            SET NEW.shipped_at = NOW();
          END IF;
          
          -- Always update updated_at
          SET NEW.updated_at = NOW();
        END;`, { raw: true });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to create order status trigger:', errorMessage);
        }
    },
    down: async (queryInterface, Sequelize) => {
        // Drop triggers
        const tables = [
            'users',
            'sellers',
            'delivery_persons',
            'salesmen',
            'products',
            'orders',
            'order_items',
            'beats',
            'stores',
            'visits',
            'complaints',
        ];
        // Drop update triggers
        for (const table of tables) {
            const triggerName = `${table}_before_update`;
            try {
                await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS ${triggerName}`, { raw: true });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to drop trigger ${triggerName}:`, errorMessage);
            }
        }
        // Drop order status trigger
        try {
            await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS orders_before_status_update', { raw: true });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop orders_before_status_update trigger:', errorMessage);
        }
    },
};
