// src/services/delivery.service.ts
import { Op, Transaction } from 'sequelize';
import { Order, OrderStatus, DeliveryStatus, OrderItem } from '../models/order.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Attachment } from '../models/attachment.model';
import { sequelize } from '../db';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create an attachment with all required fields
async function createAttachment(
  orderId: string,
  uploadedById: string,
  fileName: string,
  filePath: string,
  mimeType: string,
  type: 'signature' | 'delivery_proof' | 'return_proof',
  notes?: string | null,
  transaction?: Transaction
) {
  try {
    // Get file stats to get the actual file size
    const stats = await fs.promises.stat(filePath);
    
    const attachmentData: any = {
      id: uuidv4(),
      orderId,
      uploadedById,
      fileName,
      filePath,
      mimeType,
      type,
      size: stats.size,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Only include notes if it's provided
    if (notes !== undefined) {
      attachmentData.notes = notes;
    }
    
    return await Attachment.create(attachmentData, { transaction });
  } catch (error) {
    logger.error('Error creating attachment:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create attachment: ${error.message}`);
    }
    throw new Error('Failed to create attachment: Unknown error occurred');
  }
}

class DeliveryService {
  async getAssignedOrders(deliveryPersonId: string, status?: DeliveryStatus) {
    try {
      const where: any = {
        deliveryPersonId,
        status: OrderStatus.CONFIRMED,
      };

      if (status) {
        where.deliveryStatus = status;
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone', 'email'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            }],
          },
        ],
        order: [['deliveryDate', 'ASC']],
      });

      return orders;
    } catch (error) {
      logger.error('Error fetching assigned orders:', error);
      throw error;
    }
  }

  async updateDeliveryStatus(
    orderId: string,
    deliveryPersonId: string,
    status: DeliveryStatus,
    notes?: string
  ) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findOne({
        where: { id: orderId, deliveryPersonId },
        transaction,
      });

      if (!order) {
        throw new Error('Order not found or not assigned to this delivery person');
      }

      this.validateDeliveryStatusTransition(order.deliveryStatus, status);

      const updateData: any = { deliveryStatus: status };
      if (status === DeliveryStatus.DELIVERED) {
        updateData.status = OrderStatus.COMPLETED;
        updateData.deliveryDate = new Date();
      }

      if (notes) {
        updateData.deliveryNotes = notes;
      }

      await order.update(updateData, { transaction });
      await transaction.commit();

      return order;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating delivery status:', error);
      throw error;
    }
  }

  async uploadDeliveryProof(
    orderId: string,
    deliveryPersonId: string,
    file: Express.Multer.File,
    type: 'signature' | 'delivery_proof' | 'return_proof',
    notes?: string
  ) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findOne({
        where: { id: orderId, deliveryPersonId },
        transaction,
      });

      if (!order) {
        throw new Error('Order not found or not assigned to this delivery person');
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join('uploads', fileName);

      // Save file
      fs.writeFileSync(path.join(__dirname, '../../', filePath), file.buffer);

      // Create attachment for delivery proof
      const attachment = await createAttachment(
        orderId,
        deliveryPersonId,
        fileName,
        filePath,
        file.mimetype,
        'delivery_proof',
        notes,
        transaction
      );

      await transaction.commit();
      return attachment;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error uploading delivery proof:', error);
      throw error;
    }
  }

  async getTodaysRoute(deliveryPersonId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const orders = await Order.findAll({
        where: {
          deliveryPersonId,
          deliveryDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
          status: OrderStatus.CONFIRMED,
          deliveryStatus: {
            [Op.in]: [
              DeliveryStatus.ASSIGNED,
              DeliveryStatus.PICKED_UP,
              DeliveryStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'phone', 'email', 'address'],
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
            }],
          },
        ],
        order: [['deliveryDate', 'ASC']],
      });

      return orders;
    } catch (error) {
      logger.error('Error fetching today\'s route:', error);
      throw error;
    }
  }

  private validateDeliveryStatusTransition(currentStatus: DeliveryStatus, newStatus: DeliveryStatus) {
    const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.PENDING]: [DeliveryStatus.ASSIGNED],
      [DeliveryStatus.ASSIGNED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
      [DeliveryStatus.PICKED_UP]: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.RETURNED],
      [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED, DeliveryStatus.RETURNED],
      [DeliveryStatus.DELIVERED]: [],
      [DeliveryStatus.RETURNED]: [],
      [DeliveryStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}

export default new DeliveryService();