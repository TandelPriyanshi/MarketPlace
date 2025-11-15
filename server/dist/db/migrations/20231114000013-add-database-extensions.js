// server/src/db/migrations/20231114000013-add-database-extensions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Enable UUID extension
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        // Enable pg_trgm for fuzzy text search
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
        // Enable unaccent for accent-insensitive search
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "unaccent"');
        // Enable btree_gin for better indexing
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "btree_gin"');
    },
    down: async (queryInterface, Sequelize) => {
        // We're not dropping extensions in the down migration as they might be used by other databases
        console.log('Skipping extension cleanup in down migration');
    },
};
