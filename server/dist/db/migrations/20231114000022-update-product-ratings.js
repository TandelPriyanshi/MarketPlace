// server/src/db/migrations/20231114000022-update-product-ratings.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function to update product ratings
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_product_ratings()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update product rating and total ratings count
        UPDATE products p
        SET 
          rating = subquery.avg_rating,
          total_ratings = subquery.total_ratings,
          updated_at = NOW()
        FROM (
          SELECT 
            product_id,
            AVG(rating) as avg_rating,
            COUNT(*) as total_ratings
          FROM 
            reviews
          WHERE 
            product_id = NEW.product_id
            AND is_approved = true
          GROUP BY 
            product_id
        ) as subquery
        WHERE 
          p.id = subquery.product_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create trigger for review insert/update
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_product_ratings ON reviews;
      CREATE TRIGGER trigger_update_product_ratings
      AFTER INSERT OR UPDATE OF rating, is_approved OR DELETE
      ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_product_ratings();
    `);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_product_ratings ON reviews;
    `);
        await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_product_ratings();
    `);
    },
};
