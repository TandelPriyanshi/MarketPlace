'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename readAt column to read_at in notifications table
    await queryInterface.renameColumn('notifications', 'readAt', 'read_at');
  },

  down: async (queryInterface, Sequelize) => {
    // Rename read_at column back to readAt
    await queryInterface.renameColumn('notifications', 'read_at', 'readAt');
  }
};
