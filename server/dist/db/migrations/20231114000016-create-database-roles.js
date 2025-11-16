// server/src/db/migrations/20231114000016-create-database-roles.ts
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const executeQuery = async (query, ignoreErrors = []) => {
            try {
                await queryInterface.sequelize.query(query);
            }
            catch (error) {
                // Skip if the error is in the ignore list
                if (ignoreErrors.some(err => error.original && error.original.code === err)) {
                    console.warn(`Warning: ${error.original.code} - ${error.original.sqlMessage}`);
                    return;
                }
                console.error(`Error executing query: ${query}`, error);
                throw error;
            }
        };
        try {
            // Create admin user
            await executeQuery(`CREATE USER IF NOT EXISTS 'marketplace_admin'@'localhost' IDENTIFIED BY 'secure_password'`, ['ER_CANNOT_USER']);
            await executeQuery(`GRANT ALL PRIVILEGES ON marketplace.* TO 'marketplace_admin'@'localhost'`, ['ER_TABLEACCESS_DENIED_ERROR']);
            // Create seller user
            await executeQuery(`CREATE USER IF NOT EXISTS 'marketplace_seller'@'localhost' IDENTIFIED BY 'secure_password'`, ['ER_CANNOT_USER']);
            await executeQuery(`GRANT SELECT ON marketplace.* TO 'marketplace_seller'@'localhost'`, ['ER_TABLEACCESS_DENIED_ERROR']);
            // Only grant table-specific privileges if the tables exist
            await executeQuery(`GRANT SELECT, INSERT, UPDATE ON marketplace.products TO 'marketplace_seller'@'localhost'`, ['ER_NO_SUCH_TABLE']);
            await executeQuery(`GRANT SELECT, INSERT, UPDATE ON marketplace.orders TO 'marketplace_seller'@'localhost'`, ['ER_NO_SUCH_TABLE']);
            // Create customer user
            await executeQuery(`CREATE USER IF NOT EXISTS 'marketplace_customer'@'%' IDENTIFIED BY 'secure_password'`, ['ER_CANNOT_USER']);
            await executeQuery(`GRANT SELECT ON marketplace.products TO 'marketplace_customer'@'%'`, ['ER_NO_SUCH_TABLE']);
            await executeQuery(`GRANT SELECT, INSERT, UPDATE ON marketplace.orders TO 'marketplace_customer'@'%'`, ['ER_NO_SUCH_TABLE']);
            await executeQuery(`GRANT SELECT, INSERT, UPDATE ON marketplace.order_items TO 'marketplace_customer'@'%'`, ['ER_NO_SUCH_TABLE']);
            // Create delivery user
            await executeQuery(`CREATE USER IF NOT EXISTS 'marketplace_delivery'@'%' IDENTIFIED BY 'secure_password'`, ['ER_CANNOT_USER']);
            await executeQuery(`GRANT SELECT, UPDATE ON marketplace.orders TO 'marketplace_delivery'@'%'`, ['ER_NO_SUCH_TABLE']);
            // Create salesman user
            await executeQuery(`CREATE USER IF NOT EXISTS 'marketplace_salesman'@'localhost' IDENTIFIED BY 'secure_password'`, ['ER_CANNOT_USER']);
            await executeQuery(`GRANT SELECT ON marketplace.* TO 'marketplace_salesman'@'localhost'`, ['ER_TABLEACCESS_DENIED_ERROR']);
            await executeQuery(`GRANT INSERT, UPDATE ON marketplace.orders TO 'marketplace_salesman'@'localhost'`, ['ER_NO_SUCH_TABLE']);
            await executeQuery('FLUSH PRIVILEGES');
            console.log('Database users and roles created successfully');
        }
        catch (error) {
            console.error('Error creating database roles:', error);
            throw error;
        }
    },
    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.sequelize.query(`
        DROP USER IF EXISTS 'marketplace_admin'@'localhost';
        DROP USER IF EXISTS 'marketplace_seller'@'localhost';
        DROP USER IF EXISTS 'marketplace_customer'@'%';
        DROP USER IF EXISTS 'marketplace_delivery'@'%';
        DROP USER IF EXISTS 'marketplace_salesman'@'localhost';
        FLUSH PRIVILEGES;
      `);
            console.log('Database users removed successfully');
        }
        catch (error) {
            console.error('Error dropping database roles:', error);
            throw error;
        }
    },
};
