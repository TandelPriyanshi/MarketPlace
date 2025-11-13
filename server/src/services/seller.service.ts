import { Op, QueryTypes, Transaction } from 'sequelize';
import { Product, ProductStatus } from '../models/product.model';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../models/order.model';
import { User } from '../models/user.model';
import { sequelize } from '../db';
import { logger } from '../utils/logger';

class SellerService {
  // Product Management
  async getSellerProducts(sellerId: string, { page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string }) {
    try {
      const where: any = { sellerId };
      
      if (status) {
        where.status = status;
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

      return {
        products: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Error fetching seller products:', error);
      throw error;
    }
  }

  async createProduct(sellerId: string, productData: Partial<Product>) {
    const transaction = await sequelize.transaction();
    
    try {
      const product = await Product.create(
        {
          ...productData,
          sellerId,
          status: ProductStatus.DRAFT,
        },
        { transaction }
      );

      await transaction.commit();
      return product;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(sellerId: string, productId: string, productData: Partial<Product>) {
    const transaction = await sequelize.transaction();
    
    try {
      const [updated] = await Product.update(productData, {
        where: { id: productId, sellerId },
        returning: true,
        transaction,
      });

      if (!updated) {
        throw new Error('Product not found or not owned by seller');
      }

      await transaction.commit();
      return await Product.findByPk(productId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(sellerId: string, productId: string) {
    const transaction = await sequelize.transaction();
    
    try {
      const deleted = await Product.destroy({
        where: { id: productId, sellerId },
        transaction,
      });

      if (!deleted) {
        throw new Error('Product not found or not owned by seller');
      }

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  // Order Management
  async getSellerOrders(sellerId: string, { page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string }) {
    try {
      const where: any = { sellerId };
      
      if (status) {
        where.status = status;
      }

      const { count, rows } = await OrderItem.findAndCountAll({
        where,
        include: [
          {
            model: Order,
            as: 'order',
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'images'],
          },
        ],
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

      return {
        orders: rows,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Error fetching seller orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    sellerId: string,
    orderItemId: string,
    status: OrderStatus,
    reason?: string
  ) {
    const transaction = await sequelize.transaction();
    
    try {
      const orderItem = await OrderItem.findOne({
        where: { id: orderItemId, sellerId },
        include: [{ model: Order, as: 'order' }],
        transaction,
      });

      if (!orderItem) {
        throw new Error('Order item not found or not owned by seller');
      }

      // Validate status transition
      this.validateStatusTransition(orderItem.status, status);

      // Update order item status
      await orderItem.update({ status, ...(reason && { cancellationReason: reason }) }, { transaction });

      // Check if all items in the order have the same status
      const orderItems = await OrderItem.findAll({
        where: { orderId: orderItem.orderId },
        transaction,
      });

      const allItemsHaveSameStatus = orderItems.every(item => item.status === status);
      
      if (allItemsHaveSameStatus && orderItem.order) {
        await orderItem.order.update({ status }, { transaction });
      }

      await transaction.commit();
      return await OrderItem.findByPk(orderItemId, {
        include: [
          { model: Order, as: 'order' },
          { model: Product, as: 'product' },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  // Dashboard
  async getSellerDashboard(sellerId: string) {
    try {
      const [totalProducts, totalOrders, totalRevenueResult] = await Promise.all([
        Product.count({ where: { sellerId } }),
        OrderItem.count({ where: { sellerId } }),
        // Get total revenue using a raw query for better type safety
        (async () => {
          const result = await sequelize.query<{ total: string }>(
            `SELECT COALESCE(SUM(oi.price), 0) as total 
             FROM order_items oi 
             INNER JOIN orders o ON oi.orderId = o.id 
             WHERE oi.sellerId = :sellerId 
             AND oi.status = :status 
             AND o.paymentStatus = :paymentStatus`, 
            {
              replacements: { 
                sellerId, 
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID 
              },
              type: QueryTypes.SELECT
            }
          );
          return { total: result[0]?.total ? parseFloat(result[0].total) : 0 };
        })()
      ]);
      
      const totalRevenue = typeof totalRevenueResult === 'object' && totalRevenueResult !== null 
        ? (totalRevenueResult as { total: number }).total 
        : 0;

      const recentOrders = await OrderItem.findAll({
        where: { sellerId },
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Order, as: 'order', include: [{ model: User, as: 'user' }] },
          { model: Product, as: 'product' },
        ],
      });

      const productStatus = await Product.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { sellerId },
        group: ['status'],
        raw: true,
      });

      return {
        stats: {
          totalProducts,
          totalOrders,
          totalRevenue,
          productStatus,
        },
        recentOrders,
      };
    } catch (error) {
      logger.error('Error fetching seller dashboard:', error);
      throw error;
    }
  }

  // Helper Methods
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

export default new SellerService();
