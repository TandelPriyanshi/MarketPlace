import { Request, Response, NextFunction } from 'express';
import salesmanService from '../services/salesman.service';
import { logger } from '../utils/logger';
import { Beat } from '../models/beat.model';
import { Visit } from '../models/visit.model';
import { sequelize } from '../db';
import { Op } from 'sequelize';

export class SalesmanController {
  async createBeat(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const beat = await Beat.create({
        ...req.body,
        salesmanId,
      });

      res.status(201).json({
        success: true,
        data: beat,
        message: 'Beat created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createBeat controller:', error);
      next(error);
    }
  }

  async getBeats(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const beats = await Beat.findAll({
        where: { salesmanId },
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: beats,
      });
    } catch (error: any) {
      logger.error('Error in getBeats controller:', error);
      next(error);
    }
  }

  async getBeatById(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { id } = req.params;
      const beat = await Beat.findOne({
        where: { id, salesmanId },
      });

      if (!beat) {
        return res.status(404).json({
          success: false,
          message: 'Beat not found',
        });
      }

      res.json({
        success: true,
        data: beat,
      });
    } catch (error: any) {
      logger.error('Error in getBeatById controller:', error);
      next(error);
    }
  }

  async createVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const visit = await Visit.create({
        ...req.body,
        salesmanId,
        status: 'scheduled',
      });

      res.status(201).json({
        success: true,
        data: visit,
        message: 'Visit created successfully',
      });
    } catch (error: any) {
      logger.error('Error in createVisit controller:', error);
      next(error);
    }
  }

  async getVisits(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { status, storeId } = req.query;
      const where: any = { salesmanId };

      if (status) where.status = status;
      if (storeId) where.storeId = storeId;

      const visits = await Visit.findAll({
        where,
        order: [['scheduledAt', 'DESC']],
      });

      res.json({
        success: true,
        data: visits,
      });
    } catch (error: any) {
      logger.error('Error in getVisits controller:', error);
      next(error);
    }
  }

  async getVisitById(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { id } = req.params;
      const visit = await Visit.findOne({
        where: { id, salesmanId },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found',
        });
      }

      res.json({
        success: true,
        data: visit,
      });
    } catch (error: any) {
      logger.error('Error in getVisitById controller:', error);
      next(error);
    }
  }

  async updateVisitStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const salesmanId = req.user!.id;
      const { id } = req.params;
      const { status, checkIn, checkOut } = req.body;

      const visit = await Visit.findOne({
        where: { id, salesmanId },
      });

      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found',
        });
      }

      const updateData: any = { status };

      if (status === 'in_progress' && visit.status === 'scheduled') {
        updateData.startedAt = new Date();
        if (checkIn) updateData.checkIn = checkIn;
      }

      if (status === 'completed' && visit.status !== 'completed') {
        updateData.completedAt = new Date();
        if (checkOut) updateData.checkOut = checkOut;
      }

      await visit.update(updateData);

      res.json({
        success: true,
        data: visit,
        message: 'Visit status updated successfully',
      });
    } catch (error: any) {
      logger.error('Error in updateVisitStatus controller:', error);
      next(error);
    }
  }
}

export const salesmanController = new SalesmanController();
