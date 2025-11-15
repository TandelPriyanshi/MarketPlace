// server/src/db/migrations/20231114000019-create-notification-functions.js
'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create a function to send order status notifications
        await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION notify_order_status_change()
      RETURNS TRIGGER AS $$
      DECLARE
        notification_data json;
        user_id uuid;
        user_role text;
        notification_type text;
        title text;
        message text;
      BEGIN
        -- Only proceed if status has changed
        IF NEW.status = OLD.status AND 
           NEW.payment_status = OLD.payment_status AND 
           NEW.delivery_status = OLD.delivery_status THEN
          RETURN NEW;
        END IF;

        -- Get user ID and role
        SELECT u.id, u.role INTO user_id, user_role
        FROM users u
        WHERE u.id = NEW.user_id;

        -- Determine notification type and content based on status changes
        IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
          notification_type := 'order_delivered';
          title := 'Order Delivered';
          message := 'Your order #' || NEW.order_number || ' has been delivered.';
        ELSIF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
          notification_type := 'order_shipped';
          title := 'Order Shipped';
          message := 'Your order #' || NEW.order_number || ' has been shipped.';
        ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
          notification_type := 'order_cancelled';
          title := 'Order Cancelled';
          message := 'Your order #' || NEW.order_number || ' has been cancelled.';
        ELSIF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
          notification_type := 'payment_received';
          title := 'Payment Received';
          message := 'Payment for order #' || NEW.order_number || ' has been received.';
        ELSE
          -- For other status changes, create a generic notification
          notification_type := 'order_updated';
          title := 'Order Updated';
          message := 'Your order #' || NEW.order_number || ' status has been updated to ' || NEW.status || '.';
        END IF;

        -- Create notification data
        notification_data := json_build_object(
          'order_id', NEW.id,
          'order_number', NEW.order_number,
          'status', NEW.status,
          'payment_status', NEW.payment_status,
          'delivery_status', NEW.delivery_status
        );

        -- Insert notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          is_read,
          createdAt,
          updated_at
        ) VALUES (
          user_id,
          notification_type,
          title,
          message,
          notification_data,
          false,
          NOW(),
          NOW()
        );

        -- Notify seller about new order
        IF OLD.status IS NULL AND NEW.status = 'pending' THEN
          -- Get seller's user ID
          SELECT u.id INTO user_id
          FROM users u
          JOIN sellers s ON u.id = s.user_id
          WHERE s.id = NEW.seller_id;

          IF FOUND THEN
            INSERT INTO notifications (
              user_id,
              type,
              title,
              message,
              data,
              is_read,
              createdAt,
              updated_at
            ) VALUES (
              user_id,
              'new_order',
              'New Order Received',
              'You have received a new order #' || NEW.order_number,
              notification_data,
              false,
              NOW(),
              NOW()
            );
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
        // Create trigger for order status changes
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
      CREATE TRIGGER trigger_notify_order_status_change
      AFTER INSERT OR UPDATE OF status, payment_status, delivery_status
      ON orders
      FOR EACH ROW
      EXECUTE FUNCTION notify_order_status_change();
    `);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
    `);
        await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS notify_order_status_change();
    `);
    },
};
