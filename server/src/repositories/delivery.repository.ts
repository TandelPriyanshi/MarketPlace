import { Op } from 'sequelize';
import { DeliveryStatus } from '../models/order.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';

type DeliveryAttributes = {
  id: string;
  orderId: string;
  deliveryPersonId: string;
  status: DeliveryStatus;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  pickupAt: Date | null;
  notes: string | null;
  created_at: Date;
  updatedAt: Date;
};

class DeliveryRepository {
  private static instance: DeliveryRepository;
  
  private constructor() {}
  
  public static getInstance(): DeliveryRepository {
    if (!DeliveryRepository.instance) {
      DeliveryRepository.instance = new DeliveryRepository();
    }
    return DeliveryRepository.instance;
  }

  async create(deliveryData: Omit<DeliveryAttributes, 'id' | 'created_at' | 'updatedAt' | 'deliveredAt' | 'pickupAt'>): Promise<DeliveryAttributes> {
    const delivery = await Order.update(
      {
        deliveryStatus: deliveryData.status,
        deliveryPersonId: deliveryData.deliveryPersonId,
        estimatedDelivery: deliveryData.estimatedDelivery,
        notes: deliveryData.notes
      },
      {
        where: { id: deliveryData.orderId },
        returning: true
      }
    );
    
    return {
      ...delivery[1][0].get(),
      status: deliveryData.status,
      deliveryPersonId: deliveryData.deliveryPersonId,
      estimatedDelivery: deliveryData.estimatedDelivery,
      notes: deliveryData.notes || null
    } as DeliveryAttributes;
  }

  async findById(id: string): Promise<Order | null> {
    return await Order.findByPk(id, {
      include: [
        { model: User, as: 'deliveryPerson' },
        { model: User, as: 'user' }
      ]
    });
  }

  async findByDeliveryPerson(deliveryPersonId: string, status?: DeliveryStatus): Promise<{ rows: Order[]; count: number }> {
    const where: any = { deliveryPersonId };
    if (status) where.deliveryStatus = status;

    return await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user' }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async updateStatus(orderId: string, status: DeliveryStatus, deliveryPersonId?: string): Promise<[number, Order[]]> {
    const updateData: any = { deliveryStatus: status };
    
    if (status === DeliveryStatus.PICKED_UP) {
      updateData.pickupAt = new Date();
    } else if (status === DeliveryStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }
    
    if (deliveryPersonId) {
      updateData.deliveryPersonId = deliveryPersonId;
    }

    return await Order.update(updateData, {
      where: { id: orderId },
      returning: true
    });
  }

  async assignDeliveryPerson(orderId: string, deliveryPersonId: string): Promise<[number, Order[]]> {
    return await Order.update(
      { 
        deliveryPersonId,
        deliveryStatus: DeliveryStatus.ASSIGNED 
      },
      { 
        where: { id: orderId },
        returning: true 
      }
    );
  }

  async getDeliveryStats(deliveryPersonId?: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    delivered: number;
  }> {
    const where: any = {};
    if (deliveryPersonId) {
      where.deliveryPersonId = deliveryPersonId;
    }

    const [total, pending, inProgress, delivered] = await Promise.all([
      Order.count({ where }),
      Order.count({ where: { ...where, deliveryStatus: DeliveryStatus.PENDING } }),
      Order.count({ 
        where: { 
          ...where, 
          deliveryStatus: { 
            [Op.in]: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY] 
          } 
        } 
      }),
      Order.count({ where: { ...where, deliveryStatus: DeliveryStatus.DELIVERED } })
    ]);

    return { total, pending, inProgress, delivered };
  }
}

export default DeliveryRepository.getInstance();
