import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class CustomerController {
  // Get all sellers with optional filters
  async getSellers(req: Request, res: Response) {
    try {
      const { city, area, pincode } = req.query;
      
      const sellers = await customerService.getSellers({
        city: city as string,
        area: area as string,
        pincode: pincode as string,
      });
      
      res.json(sellers);
    } catch (error: any) {
      logger.error('Error in getSellers controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch sellers' 
      });
    }
  }

  // Place a new order
  async placeOrder(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const userId = (req as any).user.id; // From auth middleware
      const order = await customerService.placeOrder(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: order,
        message: 'Order placed successfully',
      });
    } catch (error: any) {
      logger.error('Error in placeOrder controller:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to place order' 
      });
    }
  }

  // Get order details by ID
  async getOrderDetails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      
      const order = await customerService.getOrderDetails(userId, id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
      
      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in getOrderDetails controller:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to fetch order details' 
      });
    }
  }

  // Create a new complaint
  async createComplaint(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const userId = (req as any).user.id;
      const files = req.files as Express.Multer.File[];
      
      const complaint = await customerService.createComplaint(
        userId, 
        req.body,
        files
      );
      
      res.status(201).json({
        success: true,
        data: complaint,
        message: 'Complaint submitted successfully',
      });
    } catch (error: any) {
      logger.error('Error in createComplaint controller:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to submit complaint' 
      });
    }
  }

  // Get all complaints for the current user
  async getComplaints(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;
      
      const complaints = await customerService.getUserComplaints(userId, {
        status: status as string,
      });
      
      res.json({
        success: true,
        data: complaints,
      });
    } catch (error: any) {
      logger.error('Error in getComplaints controller:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to fetch complaints' 
      });
    }
  }
}

export const customerController = new CustomerController();
