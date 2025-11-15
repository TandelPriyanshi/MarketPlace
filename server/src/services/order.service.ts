import { Op, Transaction } from 'sequelize';
import { Order, OrderStatus, PaymentStatus, OrderItem } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { sequelize } from '../db';
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED, OrderStatus.COMPLETED],
  [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURN_APPROVED, OrderStatus.RETURN_REJECTED],
  [OrderStatus.RETURN_APPROVED]: [OrderStatus.RETURN_COMPLETED],
  [OrderStatus.RETURN_REJECTED]: [],
  [OrderStatus.RETURN_COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.REFUNDED]: []
};

class OrderService {
  /**
   * Create a new order with transaction
   */
  async createOrder(userId: string, orderData: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    shippingAddress: string;
    paymentMethod: string;
  }): Promise<Order> {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate order items
      if (!orderData.items || orderData.items.length === 0) {
        throw new ValidationError('Order must contain at least one item');
      }

      // Get product details and validate stock
      const productIds = orderData.items.map(item => item.productId);
      const products = await Product.findAll({
        where: { id: { [Op.in]: productIds } },
        transaction
      });

      // Check if all products exist
      if (products.length !== orderData.items.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = orderData.items
          .filter(item => !foundIds.includes(item.productId))
          .map(item => item.productId);
        
        throw new NotFoundError(`Products not found: ${missingIds.join(', ')}`);
      }

      // Calculate total and validate stock
      let subtotal = 0;
      const orderItems = [];
      const stockUpdates = [];

      for (const item of orderData.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Validate stock
        if (product.stock < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}`
          );
        }

        // Calculate item total
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        // Prepare order item
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal,
          name: product.name,
          image: product.images?.[0] || null
        });

        // Prepare stock update
        stockUpdates.push(
          product.decrement('stock', { 
            by: item.quantity,
            transaction 
          })
        );
      }

      // Calculate tax and total (example: 10% tax)
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      // Create the order
      const order = await Order.create(
        {
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          tax,
          total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          items: orderItems
        },
        {
          include: [{ model: OrderItem, as: 'items' }],
          transaction
        }
      );

      // Update product stock
      await Promise.all(stockUpdates);

      // Update product sales count
      for (const item of orderData.items) {
        await Product.increment('soldCount', {
          by: item.quantity,
          where: { id: item.productId },
          transaction
        });
      }

      await transaction.commit();
      return order.reload({
        include: [
          { model: OrderItem, as: 'items' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DatabaseError('Failed to create order', error);
      }
      throw new DatabaseError('Failed to create order', new Error('Unknown error occurred'));
    }
  }

  /**
   * Get order by ID with validation
   */
  async getOrderById(orderId: string, userId?: string): Promise<Order> {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;

    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email', 'phone'] 
        }
      ]
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * List orders with pagination and filters
   */
  async listOrders({
    page = 1,
    limit = 10,
    userId,
    sellerId,
    status,
    paymentStatus,
    startDate,
    endDate
  }: {
    page?: number;
    limit?: number;
    userId?: string;
    sellerId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ orders: Order[]; total: number }> {
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    // If sellerId is provided, only return orders containing seller's products
    let include: any[] = [
      { model: OrderItem, as: 'items' },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
    ];

    if (sellerId) {
      include[0] = {
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          where: { sellerId },
          required: true
        }]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    return {
      orders: rows,
      total: count
    };
  }

  /**
   * Update order status with validation
   */
  private validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED, OrderStatus.COMPLETED],
    [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURN_APPROVED, OrderStatus.RETURN_REJECTED],
    [OrderStatus.RETURN_APPROVED]: [OrderStatus.RETURN_COMPLETED, OrderStatus.REFUNDED],
    [OrderStatus.RETURN_COMPLETED]: [],
    [OrderStatus.RETURN_REJECTED]: [],
    [OrderStatus.REFUNDED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.COMPLETED]: []
  };

  private async handleOrderCancellation(order: Order): Promise<void> {
    // TODO: Implement order cancellation logic
    // - Restore product stock
    // - Send cancellation email
    // - Process refund if payment was made
    console.log(`Handling cancellation for order ${order.id}`);
  }

  private async handleOrderDelivery(order: Order): Promise<void> {
    // TODO: Implement order delivery logic
    // - Update inventory
    // - Send delivery confirmation
    // - Update seller metrics
    console.log(`Handling delivery for order ${order.id}`);
  }

  private async handleReturnApproval(order: Order): Promise<void> {
    // TODO: Implement return approval logic
    // - Process return
    // - Initiate refund if applicable
    // - Update inventory
    console.log(`Handling return approval for order ${order.id}`);
  }

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus,
    userId?: string
  ): Promise<Order> {
    const order = await this.getOrderById(orderId, userId);

    const allowedStatuses = this.validTransitions[order.status] || [];
    if (!allowedStatuses.includes(status)) {
      const allowedTransitionsList = this.validTransitions[order.status] || [];
      throw new ValidationError(
        `Invalid status transition from ${order.status} to ${status}. ` +
        `Allowed transitions: ${allowedTransitionsList.join(', ') || 'none'}`
      );
    }

    // Additional validations based on status
    if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.PENDING) {
      // Only allow cancellation if order is still pending
      throw new ValidationError('Cannot cancel order after it has been confirmed');
    }

    // Update order status
    await order.update({ status });

    // Trigger side effects based on status change
    if (status === OrderStatus.CANCELLED) {
      await this.handleOrderCancellation(order);
    } else if (status === OrderStatus.DELIVERED) {
      await this.handleOrderDelivery(order);
    } else if (status === OrderStatus.RETURN_APPROVED) {
      await this.handleReturnApproval(order);
    }

    return order.reload({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });
  }

  /**
   * Update payment status with validation
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentId?: string,
    paymentDetails?: any
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    
    // Check if payment status transition is valid
    const paymentStatusTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.COMPLETED, PaymentStatus.FAILED],
      [PaymentStatus.PROCESSING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
      [PaymentStatus.PAID]: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
      [PaymentStatus.FAILED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
      [PaymentStatus.REFUNDED]: [],
      [PaymentStatus.PARTIALLY_REFUNDED]: []
    };
      
    const allowedPaymentStatuses = paymentStatusTransitions[order.paymentStatus] || [];
    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new ValidationError(
        `Invalid payment status transition from ${order.paymentStatus} to ${paymentStatus}`
      );
    }

    // Prepare update data
    const updateData: any = { paymentStatus };
    if (paymentId) updateData.paymentId = paymentId;
    if (paymentDetails) updateData.paymentDetails = paymentDetails;

    // Update order
    await order.update(updateData);

    // If payment is completed, update order status to confirmed
    if (paymentStatus === PaymentStatus.COMPLETED && order.status === OrderStatus.PENDING) {
      await order.update({ status: OrderStatus.CONFIRMED });
    }

    return order.reload({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });
  }

  // ...

  /**
   * Get user orders with pagination
   */
  async getUserOrders(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; pagination: { total: number; page: number; totalPages: number; limit: number } }> {
    const { page = 1, limit = 10, status } = options;
    const where: any = { userId };

    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
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
  }

  /**
   * Cancel an order
   */
  async cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order> {
    const transaction = await sequelize.transaction();
    
    try {
      const order = await this.getOrderById(orderId, userId);

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new ValidationError('Cannot cancel order in current status');
      }

      await order.update(
        { 
          status: OrderStatus.CANCELLED,
          isCancelled: true,
        },
        { transaction }
      );

      // Restore product stock
      if (order.items) {
        for (const item of order.items) {
          await Product.increment('stock', {
            by: item.quantity,
            where: { id: item.productId },
            transaction,
          });
        }
      }

      await transaction.commit();
      return order.reload({
        include: [
          { model: OrderItem, as: 'items' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DatabaseError('Failed to cancel order', error);
      }
      throw new DatabaseError('Failed to cancel order', new Error('Unknown error occurred'));
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId?: string, sellerId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    recentOrders: Order[];
  }> {
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (sellerId) {
      where['$items.product.sellerId$'] = sellerId;
    }

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenueResult,
      recentOrders
    ] = await Promise.all([
      Order.count({ 
        where,
        ...(sellerId ? {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              where: { sellerId },
              required: true
            }]
          }],
          distinct: true
        } : {})
      }),
      Order.count({ 
        where: { 
          ...where,
          status: OrderStatus.PENDING
        },
        ...(sellerId ? {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              where: { sellerId },
              required: true
            }]
          }],
          distinct: true
        } : {})
      }),
      Order.count({ 
        where: { 
          ...where,
          status: OrderStatus.PROCESSING
        },
        ...(sellerId ? {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              where: { sellerId },
              required: true
            }]
          }],
          distinct: true
        } : {})
      }),
      Order.count({ 
        where: { 
          ...where,
          status: OrderStatus.COMPLETED
        },
        ...(sellerId ? {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              where: { sellerId },
              required: true
            }]
          }],
          distinct: true
        } : {})
      }),
      Order.count({ 
        where: { 
          ...where,
          status: OrderStatus.CANCELLED
        },
        ...(sellerId ? {
          include: [{
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              where: { sellerId },
              required: true
            }]
          }],
          distinct: true
        } : {})
      }),
      (async () => {
        const result = await Order.findOne({
          attributes: [
            [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'totalRevenue']
          ],
          where: {
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.COMPLETED,
            ...(sellerId ? { sellerId } : {})
          },
          raw: true
        });
        return { totalRevenue: result ? (result as any).totalRevenue : 0 };
      })(),
      Order.findAll({
        where,
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { 
            model: OrderItem, 
            as: 'items',
            ...(sellerId ? {
              include: [{
                model: Product,
                where: { sellerId },
                required: true
              }]
            } : {})
          },
          { model: User, as: 'user', attributes: ['id', 'name'] }
        ]
      })
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: Number(totalRevenueResult),
      recentOrders
    };
  }
}

export default new OrderService();
