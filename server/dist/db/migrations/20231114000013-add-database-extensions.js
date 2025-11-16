// server/src/db/migrations/20231114000013-add-database-extensions.ts
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // MySQL doesn't require explicit extension loading like PostgreSQL
        // UUID functions are available by default in MySQL 8.0+
        // For fuzzy text search, we'll use MySQL's built-in full-text search
        // Create a function for case-insensitive and accent-insensitive search
        // This is a simplified version of what the PostgreSQL extensions would provide
        try {
            await queryInterface.sequelize.query(`
        CREATE FUNCTION IF NOT EXISTS unaccent(str VARCHAR(1000)) 
        RETURNS VARCHAR(1000) DETERMINISTIC
        BEGIN
          -- This is a basic implementation that handles common cases
          -- For a production environment, you might want to expand this
          DECLARE result VARCHAR(1000);
          SET result = LOWER(str);
          -- Add more replacements as needed for your use case
          SET result = REPLACE(result, 'á', 'a');
          SET result = REPLACE(result, 'é', 'e');
          SET result = REPLACE(result, 'í', 'i');
          SET result = REPLACE(result, 'ó', 'o');
          SET result = REPLACE(result, 'ú', 'u');
          RETURN result;
        END
      `);
        }
        catch (error) {
            console.log('Note: unaccent function already exists or could not be created');
        }
        // For fuzzy search, we'll rely on MySQL's FULLTEXT indexes
        // which can be added in the table creation or alteration migrations
    },
    down: async (queryInterface, Sequelize) => {
        // Drop the unaccent function if it exists
        try {
            await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS unaccent');
        }
        catch (error) {
            console.log('Note: unaccent function could not be dropped');
        }
    },
};
