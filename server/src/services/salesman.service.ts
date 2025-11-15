import { Op } from 'sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit, VisitStatus } from '../models/visit.model';
import { sequelize } from '../db';
import { logger } from '../utils/logger';

class SalesmanService {
  async getSalesmanBeats(salesmanId: string) {
    try {
      return await Beat.findAll({
        where: { salesmanId },
        include: [
          {
            model: Store,
            attributes: ['id', 'name', 'contactPerson', 'phone', 'lastVisitedAt'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error fetching salesman beats:', error);
      throw error;
    }
  }

  async createBeat(salesmanId: string, beatData: Partial<Beat>) {
    try {
      const beat = await Beat.create({
        ...beatData,
        salesmanId,
      });

      return await Beat.findByPk(beat.id, {
        include: [Store],
      });
    } catch (error) {
      logger.error('Error creating beat:', error);
      throw error;
    }
  }

  async logVisit(salesmanId: string, visitData: Partial<Visit>) {
    try {
      return await Visit.create({
        ...visitData,
        salesmanId,
        status: VisitStatus.SCHEDULED,
      });
    } catch (error) {
      logger.error('Error logging visit:', error);
      throw error;
    }
  }

  async updateVisit(visitId: string, salesmanId: string, updateData: Partial<Visit>) {
    try {
      const visit = await Visit.findOne({
        where: { id: visitId, salesmanId },
      });

      if (!visit) {
        throw new Error('Visit not found');
      }

      const updatePayload: any = { ...updateData };

      if (updateData.status === VisitStatus.IN_PROGRESS && visit.status === VisitStatus.SCHEDULED) {
        updatePayload.startedAt = new Date();
      }

      if (updateData.status === VisitStatus.COMPLETED && visit.status !== VisitStatus.COMPLETED) {
        updatePayload.completedAt = new Date();
      }

      await visit.update(updatePayload);
      return visit.reload();
    } catch (error) {
      logger.error('Error updating visit:', error);
      throw error;
    }
  }

  async getVisits(salesmanId: string, filters: { status?: VisitStatus; storeId?: string } = {}) {
    try {
      const where: any = { salesmanId };
      if (filters.status) where.status = filters.status;
      if (filters.storeId) where.storeId = filters.storeId;

      return await Visit.findAll({
        where,
        include: [
          {
            model: Store,
            attributes: ['id', 'name', 'address', 'contactPerson', 'phone'],
          },
        ],
        order: [['scheduledAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error fetching visits:', error);
      throw error;
    }
  }
}

export default new SalesmanService();
