import { Op } from 'sequelize';
import { User, UserRole } from '../models/user.model';
import { Order, OrderStatus } from '../models/order.model';
import { Complaint, ComplaintStatus, ComplaintType } from '../models/complaint.model';
import { Product } from '../models/product.model';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

class CustomerService {
  // Get all sellers with optional filters
  async getSellers(filters: { city?: string; area?: string; pincode?: string }) {
    try {
      const whereClause: any = { role: UserRole.SELLER, isActive: true };
      
      if (filters.city) whereClause.city = { [Op.iLike]: `%${filters.city}%` };
      if (filters.area) whereClause.area = { [Op.iLike]: `%${filters.area}%` };
      if (filters.pincode) whereClause.pincode = filters.pincode;

      const sellers = await User.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'email', 'phone', 'profileImage', 'rating', 'totalRatings'],
        include: [
          {
            model: Product,
            as: 'products',
            where: { status: 'published' },
            required: false,
            attributes: ['id', 'name', 'price', 'images'],
          },
        ],
      });

      return sellers;
    } catch (error) {
      logger.error('Error in getSellers:', error);
      throw new Error('Failed to fetch sellers');
    }
  }

  // Place a new order
  async placeOrder(userId: string, orderData: any) {
    const transaction = await Order.sequelize!.transaction();
    
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Calculate total amount and validate products
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of orderData.items) {
        const product = await Product.findByPk(item.productId, { transaction });
        
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
        
        // Update product stock
        product.stock -= item.quantity;
        await product.save({ transaction });
        
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          productId: product.id,
          sellerId: product.sellerId,
          quantity: item.quantity,
          price: product.price,
          status: OrderStatus.PENDING,
        });
      }
      
      // Create order
      const order = await Order.create(
        {
          userId,
          orderNumber,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: 'pending',
          deliveryStatus: 'pending',
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress || orderData.shippingAddress,
        },
        { transaction, include: ['items'] }
      );
      
      // Create order items
      await Promise.all(
        orderItems.map((item) =>
          (order as any).createOrderItem(item, { transaction })
        )
      );
      
      await transaction.commit();
      
      // TODO: Trigger payment process
      
      return order;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error in placeOrder:', error);
      throw error;
    }
  }

  // Get order details by ID
  async getOrderDetails(userId: string, orderId: string) {
    try {
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: (Order.associations as any).items,
            include: [
              { model: Product, as: 'product' },
              { model: User, as: 'seller' },
            ],
          },
        ],
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Error in getOrderDetails:', error);
      throw error;
    }
  }

  // Create a new complaint
  async createComplaint(userId: string, complaintData: any, files?: Express.Multer.File[]) {
    try {
      // Validate order exists and belongs to user if provided
      if (complaintData.orderId) {
        const order = await Order.findOne({
          where: { id: complaintData.orderId, userId },
        });
        
        if (!order) {
          throw new Error('Order not found or access denied');
        }
      }

      // Handle file uploads if any
      const attachments = [];
      
      if (files && files.length > 0) {
        const uploadDir = path.join(__dirname, '../../uploads/complaints');
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Process each file
        for (const file of files) {
          const fileExt = path.extname(file.originalname);
          const fileName = `${uuidv4()}${fileExt}`;
          const filePath = path.join(uploadDir, fileName);
          
          await writeFileAsync(filePath, file.buffer);
          attachments.push(`/uploads/complaints/${fileName}`);
        }
      }

      // Create complaint
      const complaint = await Complaint.create({
        userId,
        orderId: complaintData.orderId || null,
        type: complaintData.type,
        title: complaintData.title,
        description: complaintData.description,
        status: ComplaintStatus.OPEN,
        attachments,
      });

      // TODO: Send notification to admin/seller
      
      return complaint;
    } catch (error) {
      logger.error('Error in createComplaint:', error);
      throw error;
    }
  }

  // Get all complaints for a user
  async getUserComplaints(userId: string, filters: { status?: string } = {}) {
    try {
      const whereClause: any = { userId };
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      const complaints = await Complaint.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Order, attributes: ['id', 'orderNumber'] },
          { model: User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
        ],
      });
      
      return complaints;
    } catch (error) {
      logger.error('Error in getUserComplaints:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
