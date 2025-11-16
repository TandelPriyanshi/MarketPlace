// server/src/db/migrations/20231114000025-create-addresses-table.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('addresses', {
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
            type: {
                type: Sequelize.ENUM('home', 'work', 'other'),
                defaultValue: 'home',
            },
            isDefault: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            recipientName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            addressLine1: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            addressLine2: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            postalCode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            country: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'India',
            },
            latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: true,
            },
            longitude: {
                type: Sequelize.DECIMAL(11, 8),
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
        // Add indexes with specific names to avoid conflicts
        const indexes = [
            { fields: ['userId'], name: 'idx_addresses_user_id' },
            { fields: ['type'], name: 'idx_addresses_type' },
            { fields: ['isDefault'], name: 'idx_addresses_is_default' },
            { fields: ['city'], name: 'idx_addresses_city' },
            { fields: ['state'], name: 'idx_addresses_state' },
            { fields: ['postalCode'], name: 'idx_addresses_postal_code' },
            { fields: ['country'], name: 'idx_addresses_country' }
        ];
        // Check if indexes exist before creating them
        for (const index of indexes) {
            try {
                await queryInterface.addIndex('addresses', index.fields, { name: index.name });
            }
            catch (error) {
                console.log(`Index ${index.name} already exists, skipping...`);
            }
        }
        // Spatial index removed as we're using separate latitude and longitude columns
        // Drop existing triggers if they exist
        await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_address_insert');
        await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_address_update');
        // Drop the procedure if it exists
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS ensure_single_default_address');
        // Create a stored procedure to ensure only one default address per user
        await queryInterface.sequelize.query(`
      CREATE PROCEDURE ensure_single_default_address(IN user_id_param VARCHAR(36), IN address_id_param VARCHAR(36))
      MODIFIES SQL DATA
      BEGIN
        UPDATE addresses
        SET isDefault = false
        WHERE userId = user_id_param
        AND id != address_id_param;
      END`);
        // Create trigger for insert
        await queryInterface.sequelize.query(`
      CREATE TRIGGER before_address_insert
      BEFORE INSERT ON addresses
      FOR EACH ROW
      BEGIN
        IF NEW.isDefault = 1 THEN
          CALL ensure_single_default_address(NEW.userId, NEW.id);
        END IF;
      END`);
        // Create trigger for update
        await queryInterface.sequelize.query(`
      CREATE TRIGGER before_address_update
      BEFORE UPDATE ON addresses
      FOR EACH ROW
      BEGIN
        IF NEW.isDefault = 1 AND (OLD.isDefault = 0 OR OLD.isDefault IS NULL) THEN
          CALL ensure_single_default_address(NEW.userId, NEW.id);
        END IF;
      END`);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_address_insert');
        await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_address_update');
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS ensure_single_default_address');
        await queryInterface.dropTable('addresses');
    },
};
