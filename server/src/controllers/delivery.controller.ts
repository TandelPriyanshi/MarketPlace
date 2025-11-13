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
}

export default new DeliveryController();