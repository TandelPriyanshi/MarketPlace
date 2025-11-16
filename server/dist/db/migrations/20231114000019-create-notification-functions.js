// server/src/db/migrations/20231114000019-create-notification-functions.ts
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: async (queryInterface) => {
        // Drop existing procedures if they exist
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS notify_new_order');
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS notify_order_update');
        // Create a stored procedure for new order notifications
        await queryInterface.sequelize.query(`
      CREATE PROCEDURE notify_new_order(IN order_id INT, IN order_number VARCHAR(255), IN seller_id INT)
      BEGIN
        DECLARE seller_user_id INT;
        
        -- Get seller's user ID
        SELECT u.id INTO seller_user_id
        FROM users u
        JOIN sellers s ON u.id = s.user_id
        WHERE s.id = seller_id
        LIMIT 1;
        
        -- Insert notification for the seller
        IF seller_user_id IS NOT NULL THEN
          INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            isRead,
            created_at,
            updated_at
          ) 
          SELECT 
            seller_user_id,
            'new_order',
            'New Order Received',
            CONCAT('You have received a new order #', order_number),
            JSON_OBJECT(
              'order_id', order_id,
              'order_number', order_number
            ),
            false,
            NOW(),
            NOW();
        END IF;
      END;
    `);
        // Create a stored procedure for order updates
        await queryInterface.sequelize.query(`
      CREATE PROCEDURE notify_order_update(
        IN order_id INT,
        IN order_number VARCHAR(255),
        IN user_id INT,
        IN old_status VARCHAR(50),
        IN new_status VARCHAR(50),
        IN old_payment_status VARCHAR(50),
        IN new_payment_status VARCHAR(50)
      )
      proc: BEGIN
        DECLARE notification_type VARCHAR(50);
        DECLARE title VARCHAR(255);
        DECLARE message TEXT;
        
        -- Only proceed if status has changed
        IF (new_status = old_status AND 
            new_payment_status = old_payment_status) THEN
          LEAVE proc;
        END IF;

        -- Determine notification type and content based on status changes
        IF new_status = 'delivered' AND old_status != 'delivered' THEN
          SET notification_type = 'order_delivered';
          SET title = 'Order Delivered';
          SET message = CONCAT('Your order #', order_number, ' has been delivered.');
        ELSEIF new_status = 'shipped' AND old_status != 'shipped' THEN
          SET notification_type = 'order_shipped';
          SET title = 'Order Shipped';
          SET message = CONCAT('Your order #', order_number, ' has been shipped.');
        ELSEIF new_status = 'cancelled' AND old_status != 'cancelled' THEN
          SET notification_type = 'order_cancelled';
          SET title = 'Order Cancelled';
          SET message = CONCAT('Your order #', order_number, ' has been cancelled.');
        ELSEIF new_payment_status = 'paid' AND old_payment_status != 'paid' THEN
          SET notification_type = 'payment_received';
          SET title = 'Payment Received';
          SET message = CONCAT('Payment for order #', order_number, ' has been received.');
        ELSE
          -- For other status changes, create a generic notification
          SET notification_type = 'order_updated';
          SET title = 'Order Updated';
          SET message = CONCAT('Your order #', order_number, ' status has been updated to ', new_status, '.');
        END IF;

        -- Insert notification for the customer
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          isRead,
          created_at,
          updated_at
        ) VALUES (
          user_id,
          notification_type,
          title,
          message,
          JSON_OBJECT(
            'order_id', order_id,
            'order_number', order_number,
            'status', new_status,
            'payment_status', new_payment_status
          ),
          false,
          NOW(),
          NOW()
        );
      END;
    `);
    },
    down: async (queryInterface) => {
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS notify_new_order');
        await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS notify_order_update');
    }
};
