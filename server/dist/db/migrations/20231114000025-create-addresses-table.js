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
        await queryInterface.addIndex('addresses', ['userId']);
        await queryInterface.addIndex('addresses', ['type']);
        await queryInterface.addIndex('addresses', ['isDefault']);
        await queryInterface.addIndex('addresses', ['city']);
        await queryInterface.addIndex('addresses', ['state']);
        await queryInterface.addIndex('addresses', ['postalCode']);
        await queryInterface.addIndex('addresses', ['country']);
        await queryInterface.addIndex('addresses', ['location'], { type: 'SPATIAL' });
        // Add a function to ensure only one default address per user
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION ensure_single_default_address()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_default = true THEN
          UPDATE addresses
          SET is_default = false
          WHERE user_id = NEW.user_id
          AND id != NEW.id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create trigger for default address
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON addresses;
      CREATE TRIGGER trigger_ensure_single_default_address
      BEFORE INSERT OR UPDATE OF is_default
      ON addresses
      FOR EACH ROW
      EXECUTE FUNCTION ensure_single_default_address();
    `);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON addresses;
    `);
        await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS ensure_single_default_address();
    `);
        await queryInterface.dropTable('addresses');
    },
};
