import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit } from '../models/visit.model';
import { CreateVisitDto, UpdateVisitDto, RecordAttendanceDto, PerformanceQueryDto, CreateBeatDto } from '../dto/salesman.dto';

@Injectable()
export class SalesmanService {
  constructor(
    @InjectModel(Salesman) private salesmanModel: typeof Salesman,
    @InjectModel(Beat) private beatModel: typeof Beat,
    @InjectModel(Store) private storeModel: typeof Store,
    @InjectModel(Visit) private visitModel: typeof Visit,
  ) {}

  // Beats
  async getSalesmanBeats(salesmanId: string) {
    return this.beatModel.findAll({
      where: { salesmanId },
      include: [
        {
          model: Store,
          attributes: ['id', 'name', 'contactPerson', 'phone', 'lastVisitedAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async createBeat(salesmanId: string, createBeatDto: CreateBeatDto) {
    const { storeIds, ...beatData } = createBeatDto;
    
    const beat = await this.beatModel.create({
      ...beatData,
      salesmanId,
    });

    if (storeIds && storeIds.length > 0) {
      await this.storeModel.update(
        { beatId: beat.id },
        { where: { id: { [Op.in]: storeIds } } }
      );
    }

    return this.beatModel.findByPk(beat.id, {
      include: [Store],
    });
  }

  // Visits
  async logVisit(salesmanId: string, createVisitDto: CreateVisitDto) {
    return this.visitModel.create({
      ...createVisitDto,
      salesmanId,
      status: 'scheduled',
    });
  }

  async updateVisit(visitId: string, salesmanId: string, updateVisitDto: UpdateVisitDto) {
    const visit = await this.visitModel.findOne({
      where: { id: visitId, salesmanId },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    // Create a new object to avoid mutating the original DTO
    const updateData: Partial<UpdateVisitDto> = { ...updateVisitDto };

    // If status is being updated to in_progress, set startedAt
    if (updateData.status === 'in_progress' && visit.status === 'scheduled') {
      updateData.startedAt = new Date();
    }

    // If status is being updated to completed, set completedAt
    if (updateData.status === 'completed' && visit.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    await visit.update(updateData);
    return visit.reload();
  }

  // Attendance
  async recordAttendance(salesmanId: string, attendanceData: RecordAttendanceDto) {
    return this.salesmanModel.update(
      {
        lastActiveAt: attendanceData.timestamp,
        lastLocation: {
          type: 'Point',
          coordinates: [
            attendanceData.location.longitude,
            attendanceData.location.latitude,
          ],
        },
      },
      {
        where: { id: salesmanId },
        returning: true,
      },
    );
  }

  // Performance
  async getPerformanceMetrics(salesmanId: string, query: PerformanceQueryDto) {
    const { period = 'month', startDate, endDate } = query;
    const date = new Date();
    let start = new Date();
    let end = new Date();

    // Set date range based on period
    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(date.getDate() - date.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(date.getDate() + (6 - date.getDay()));
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    // Override with custom dates if provided
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    // Get visit statistics
    if (!this.visitModel.sequelize) {
      throw new Error('Sequelize instance is not available');
    }

    const sequelize = this.visitModel.sequelize;
    const visits = await this.visitModel.findAll({
      where: {
        salesmanId,
        scheduledAt: {
          [Op.between]: [start, end],
        },
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalVisits'],
        [sequelize.fn('COUNT', sequelize.literal('DISTINCT DATE(scheduledAt)')), 'activeDays'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), 'completedVisits'],
      ],
      raw: true,
    });

    // Get beat completion rate
    if (!this.beatModel.sequelize) {
      throw new Error('Sequelize instance is not available for beat model');
    }

    const beats = await this.beatModel.findAll({
      where: {
        salesmanId,
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start },
      },
      attributes: [
        'id',
        'name',
        'status',
        'startDate',
        'endDate',
        [
          this.beatModel.sequelize.literal(`(
            SELECT COUNT(DISTINCT v.id) 
            FROM visits v 
            WHERE v.beat_id = Beat.id 
            AND v.status = 'completed'
            AND v.scheduledAt BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'
          )`),
          'completedVisits'
        ]
      ],
    });

    const totalBeats = beats.length;
    const completedBeats = beats.filter(beat => beat.get('status') === 'completed').length;
    const completionRate = totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;

    return {
      period: { start, end },
      visits: visits[0] || { totalVisits: 0, activeDays: 0, completedVisits: 0 },
      beats: {
        total: totalBeats,
        completed: completedBeats,
        completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      },
    };
  }
}
