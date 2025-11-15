// server/src/db/migrations/20231114000011-add-triggers-and-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function to update updated_at timestamp
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
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
        for (const table of tables) {
            const triggerName = `${table}_update_updated_at`;
            try {
                // Drop trigger if it exists
                await queryInterface.sequelize.query(`
          DROP TRIGGER IF EXISTS ${triggerName} ON "${table}";
        `);
                // Create trigger
                await queryInterface.sequelize.query(`
          CREATE TRIGGER ${triggerName}
          BEFORE UPDATE ON "${table}"
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to create trigger for ${table}:`, errorMessage);
            }
        }
        // Create a function to handle order status changes
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION handle_order_status_change()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update order status timestamp based on status
        IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
          NEW.delivered_at = NOW();
        ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
          NEW.cancelled_at = NOW();
        ELSIF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
          NEW.shipped_at = NOW();
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create trigger for order status changes
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS orders_handle_status_change ON orders;
      CREATE TRIGGER orders_handle_status_change
      BEFORE UPDATE OF status ON orders
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status)
      EXECUTE FUNCTION handle_order_status_change();
    `);
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
        for (const table of tables) {
            const triggerName = `${table}_update_updated_at`;
            try {
                await queryInterface.sequelize.query(`
          DROP TRIGGER IF EXISTS ${triggerName} ON "${table}";
        `);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Failed to drop trigger ${triggerName}:`, errorMessage);
            }
        }
        // Drop order status change trigger
        try {
            await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS orders_handle_status_change ON orders;
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop orders_handle_status_change trigger:', errorMessage);
        }
        // Drop functions
        try {
            await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS update_updated_at_column();
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop update_updated_at_column function:', errorMessage);
        }
        try {
            await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS handle_order_status_change();
      `);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Failed to drop handle_order_status_change function:', errorMessage);
        }
    },
};
