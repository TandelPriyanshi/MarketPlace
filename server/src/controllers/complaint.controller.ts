import { Request, Response, NextFunction } from 'express';
import { complaintService } from '../services/complaint.service';
import { logger } from '../utils/logger';

export class ComplaintController {
  async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];

      const complaint = await complaintService.createComplaintWithFiles(userId, req.body, files);

      res.status(201).json({
        success: true,
        data: complaint,
        message: 'Complaint submitted successfully',
      });
    } catch (error: any) {
      logger.error('Error in createComplaint controller:', error);
      next(error);
    }
  }

  async getComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await complaintService.getUserComplaints(userId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        status: status as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in getComplaints controller:', error);
      next(error);
    }
  }

  async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const complaint = await complaintService.getComplaintById(userId, id);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
        });
      }

      res.json({
        success: true,
        data: complaint,
      });
    } catch (error: any) {
      logger.error('Error in getComplaintById controller:', error);
      next(error);
    }
  }

  async updateComplaintStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes } = req.body;

      const complaint = await complaintService.updateComplaintStatus(id, status, resolutionNotes);

      res.json({
        success: true,
        data: complaint,
        message: 'Complaint status updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateComplaintStatus controller:', error);
      next(error);
    }
  }
}

export const complaintController = new ComplaintController();

