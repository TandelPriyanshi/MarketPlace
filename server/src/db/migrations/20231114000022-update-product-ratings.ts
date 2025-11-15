// server/src/db/migrations/20231114000022-update-product-ratings.ts
'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Drop existing triggers and procedures first
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_insert');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_update');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_delete');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS update_product_rating');

    // Create a stored procedure to update product ratings
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE update_product_rating(IN product_id_param INT)
      BEGIN
        DECLARE avg_rating DECIMAL(3,2);
        DECLARE total_ratings_count INT;
        
        -- Calculate average rating and count of approved reviews
        SELECT 
          IFNULL(AVG(rating), 0) as avg_rating,
          COUNT(*) as total_ratings
        INTO 
          avg_rating,
          total_ratings_count
        FROM 
          reviews
        WHERE 
          productId = product_id_param
          AND isApproved = TRUE;
        
        -- Update the product with new rating and count
        UPDATE products 
        SET 
          rating = avg_rating,
          total_ratings = total_ratings_count,
          updatedAt = NOW()
        WHERE 
          id = product_id_param;
      END;
    `);

    // Create trigger for review insert
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_review_insert
      AFTER INSERT ON reviews
      FOR EACH ROW
      BEGIN
        CALL update_product_rating(NEW.productId);
      END;
    `);

    // Create trigger for review update
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_review_update
      AFTER UPDATE ON reviews
      FOR EACH ROW
      BEGIN
        IF OLD.rating != NEW.rating OR OLD.isApproved != NEW.isApproved THEN
          CALL update_product_rating(NEW.productId);
        END IF;
      END;
    `);

    // Create trigger for review delete
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_review_delete
      AFTER DELETE ON reviews
      FOR EACH ROW
      BEGIN
        CALL update_product_rating(OLD.productId);
      END;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_insert');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_update');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_review_delete');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS update_product_rating');
  },
};