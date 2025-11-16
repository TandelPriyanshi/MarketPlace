// src/controllers/delivery.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import deliveryService from '../services/delivery.service';
import { DeliveryStatus } from '../models/order.model';
import { logger } from '../utils/logger';

class DeliveryController {
  async getAssignedOrders(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const deliveryPersonId = req.user!.id;
      
      const orders = await deliveryService.getAssignedOrders(
        deliveryPersonId,
        status as DeliveryStatus
      );

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      logger.error('Error in getAssignedOrders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch assigned orders',
      });
    }
  }

  async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      const deliveryPersonId = req.user!.id;

      const order = await deliveryService.updateDeliveryStatus(
        id,
        deliveryPersonId,
        status,
        notes
      );

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in updateDeliveryStatus:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update delivery status',
      });
    }
  }

  async uploadDeliveryProof(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, notes } = req.body;
      const deliveryPersonId = req.user!.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const attachment = await deliveryService.uploadDeliveryProof(
        id,
        deliveryPersonId,
        req.file,
        type,
        notes
      );

      res.json({
        success: true,
        data: attachment,
      });
    } catch (error: any) {
      logger.error('Error in uploadDeliveryProof:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload delivery proof',
      });
    }
  }

  async getTodaysRoute(req: Request, res: Response) {
    try {
      const deliveryPersonId = req.user!.id;
      const orders = await deliveryService.getTodaysRoute(deliveryPersonId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      logger.error('Error in getTodaysRoute:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch today\'s route',
      });
    }
  }

  async getAssignedDeliveries(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10, startDate, endDate } = req.query;
      const deliveryPersonId = req.user!.id;
      
      // For now, reuse the getAssignedOrders logic
      // TODO: Implement proper pagination and date filtering in the service
      const orders = await deliveryService.getAssignedOrders(
        deliveryPersonId,
        status as any
      );

      // Transform orders to delivery format expected by client
      const deliveries = orders.map((order: any) => ({
        id: order.id,
        orderId: order.id,
        customerName: order.customer?.name || 'Unknown Customer',
        customerAddress: order.deliveryAddress || 'No Address',
        customerPhone: order.customer?.phone || 'No Phone',
        deliveryPersonId: order.deliveryPersonId,
        deliveryPersonName: order.deliveryPerson?.name || 'Not Assigned',
        status: order.status === 'out_for_delivery' ? 'in_transit' : 
                order.status === 'delivered' ? 'delivered' : 
                order.status === 'picked_up' ? 'picked_up' : 
                'assigned',
        assignedAt: order.createdAt,
        pickedUpAt: order.pickedUpAt,
        deliveredAt: order.deliveredAt,
        notes: order.notes,
        proofOfDelivery: order.proofOfDelivery,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        route: order.route,
        distance: order.distance,
      }));

      res.json({
        success: true,
        data: {
          deliveries,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: deliveries.length,
            totalPages: Math.ceil(deliveries.length / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      logger.error('Error in getAssignedDeliveries:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch assigned deliveries',
      });
    }
  }

  async getDeliveryStats(req: Request, res: Response) {
    try {
      const deliveryPersonId = req.user!.id;
      
      // Get all assigned orders
      const orders = await deliveryService.getAssignedOrders(deliveryPersonId);
      
      // Calculate statistics
      const totalDeliveries = orders.length;
      const completedDeliveries = orders.filter((order: any) => order.status === 'delivered').length;
      const failedDeliveries = orders.filter((order: any) => order.status === 'returned' || order.status === 'cancelled').length;
      
      // Calculate average delivery time (simplified)
      const completedOrders = orders.filter((order: any) => order.status === 'delivered' && order.deliveredAt);
      const averageDeliveryTime = completedOrders.length > 0 
        ? completedOrders.reduce((acc: number, order: any) => {
            if (order.deliveredAt && order.pickedUpAt) {
              const time = new Date(order.deliveredAt).getTime() - new Date(order.pickedUpAt).getTime();
              return acc + time;
            }
            return acc;
          }, 0) / completedOrders.length / (1000 * 60) // Convert to minutes
        : 0;

      // Calculate total distance (simplified)
      const totalDistance = orders.reduce((acc: number, order: any) => acc + (order.distance || 0), 0);

      res.json({
        success: true,
        data: {
          totalDeliveries,
          completedDeliveries,
          failedDeliveries,
          averageDeliveryTime: Math.round(averageDeliveryTime),
          totalDistance: Math.round(totalDistance * 100) / 100,
        },
      });
    } catch (error: any) {
      logger.error('Error in getDeliveryStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch delivery statistics',
      });
    }
  }
}

export default new DeliveryController();