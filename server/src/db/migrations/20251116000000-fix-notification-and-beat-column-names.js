'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix notifications table column names
    await queryInterface.renameColumn('notifications', 'userId', 'user_id');
    
    // Fix beats table column names
    await queryInterface.renameColumn('beats', 'salesmanId', 'salesman_id');
    
    // Fix visits table column names if they exist
    try {
      await queryInterface.renameColumn('visits', 'salesmanId', 'salesman_id');
    } catch (error) {
      // Column might not exist or already renamed
      console.log('Visits table salesmanId column already handled or does not exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert notifications table column names
    await queryInterface.renameColumn('notifications', 'user_id', 'userId');
    
    // Revert beats table column names
    await queryInterface.renameColumn('beats', 'salesman_id', 'salesmanId');
    
    // Revert visits table column names if they exist
    try {
      await queryInterface.renameColumn('visits', 'salesman_id', 'salesmanId');
    } catch (error) {
      // Column might not exist or already reverted
      console.log('Visits table salesman_id column already handled or does not exist');
    }
  },
};
