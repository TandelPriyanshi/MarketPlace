import { Op, Transaction } from 'sequelize';
import { Order, OrderStatus, PaymentStatus, DeliveryStatus } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';

export class OrderRepository {
  async createOrder(orderData: Partial<Order>, items: Array<Partial<OrderItem>>, transaction?: Transaction): Promise<Order> {
    const order = await Order.create(orderData, { transaction });
    
    // Create order items
    const orderItems = items.map(item => ({
      ...item,
      orderId: order.id,
    }));
    
    await OrderItem.bulkCreate(orderItems, { transaction });
    
    // We just created this order, so it should exist
    return (await this.findById(order.id, transaction))!;
  }

  async findById(id: string, transaction?: Transaction): Promise<Order | null> {
    return Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { association: 'user' },
        { association: 'seller' },
        { association: 'deliveryPerson' },
      ],
      transaction,
    });
  }

  async updateOrderStatus(
    id: string, 
    status: OrderStatus,
    transaction?: Transaction
  ): Promise<[number, Order[]]> {
    return Order.update(
      { status },
      { 
        where: { id },
        returning: true,
        transaction,
      }
    );
  }

  async updatePaymentStatus(
    id: string, 
    paymentStatus: PaymentStatus,
    transaction?: Transaction
  ): Promise<[number, Order[]]> {
    return Order.update(
      { paymentStatus },
      { 
        where: { id },
        returning: true,
        transaction,
      }
    );
  }

  async updateDeliveryStatus(
    id: string, 
    deliveryStatus: DeliveryStatus,
    deliveryPersonId?: string,
    transaction?: Transaction
  ): Promise<[number, Order[]]> {
    const updateData: any = { deliveryStatus };
    
    if (deliveryPersonId) {
      updateData.deliveryPersonId = deliveryPersonId;
    }
    
    return Order.update(
      updateData,
      { 
        where: { id },
        returning: true,
        transaction,
      }
    );
  }

  async findOrdersByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<{ rows: Order[]; count: number }> {
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    return Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { association: 'seller' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  async findOrdersBySeller(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus
  ): Promise<{ rows: Order[]; count: number }> {
    const where: any = { sellerId };
    
    if (status) {
      where.status = status;
    }
    
    return Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { association: 'user' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  async findAvailableDeliveryOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<{ rows: Order[]; count: number }> {
    return Order.findAndCountAll({
      where: {
        deliveryStatus: DeliveryStatus.PENDING,
        status: {
          [Op.notIn]: [OrderStatus.CANCELLED, OrderStatus.REFUNDED]
        },
        deliveryPersonId: null
      },
      include: [
        { model: OrderItem, as: 'items' },
        { association: 'user' },
        { association: 'seller' },
      ],
      order: [['created_at', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });
  }

  async findDeliveryPersonOrders(
    deliveryPersonId: string,
    page: number = 1,
    limit: number = 10,
    status?: DeliveryStatus
  ): Promise<{ rows: Order[]; count: number }> {
    const where: any = { deliveryPersonId };
    
    if (status) {
      where.deliveryStatus = status;
    }
    
    return Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { association: 'user' },
        { association: 'seller' },
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
  }
}
