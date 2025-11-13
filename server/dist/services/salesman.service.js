"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesmanService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const salesman_model_1 = require("../models/salesman.model");
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const visit_model_1 = require("../models/visit.model");
let SalesmanService = class SalesmanService {
    constructor(salesmanModel, beatModel, storeModel, visitModel) {
        this.salesmanModel = salesmanModel;
        this.beatModel = beatModel;
        this.storeModel = storeModel;
        this.visitModel = visitModel;
    }
    // Beats
    async getSalesmanBeats(salesmanId) {
        return this.beatModel.findAll({
            where: { salesmanId },
            include: [
                {
                    model: store_model_1.Store,
                    attributes: ['id', 'name', 'contactPerson', 'phone', 'lastVisitedAt'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    async createBeat(salesmanId, createBeatDto) {
        const { storeIds, ...beatData } = createBeatDto;
        const beat = await this.beatModel.create({
            ...beatData,
            salesmanId,
        });
        if (storeIds && storeIds.length > 0) {
            await this.storeModel.update({ beatId: beat.id }, { where: { id: { [sequelize_2.Op.in]: storeIds } } });
        }
        return this.beatModel.findByPk(beat.id, {
            include: [store_model_1.Store],
        });
    }
    // Visits
    async logVisit(salesmanId, createVisitDto) {
        return this.visitModel.create({
            ...createVisitDto,
            salesmanId,
            status: 'scheduled',
        });
    }
    async updateVisit(visitId, salesmanId, updateVisitDto) {
        const visit = await this.visitModel.findOne({
            where: { id: visitId, salesmanId },
        });
        if (!visit) {
            throw new common_1.NotFoundException('Visit not found');
        }
        // Create a new object to avoid mutating the original DTO
        const updateData = { ...updateVisitDto };
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
    async recordAttendance(salesmanId, attendanceData) {
        return this.salesmanModel.update({
            lastActiveAt: attendanceData.timestamp,
            lastLocation: {
                type: 'Point',
                coordinates: [
                    attendanceData.location.longitude,
                    attendanceData.location.latitude,
                ],
            },
        }, {
            where: { id: salesmanId },
            returning: true,
        });
    }
    // Performance
    async getPerformanceMetrics(salesmanId, query) {
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
        if (startDate)
            start = new Date(startDate);
        if (endDate)
            end = new Date(endDate);
        // Get visit statistics
        if (!this.visitModel.sequelize) {
            throw new Error('Sequelize instance is not available');
        }
        const sequelize = this.visitModel.sequelize;
        const visits = await this.visitModel.findAll({
            where: {
                salesmanId,
                scheduledAt: {
                    [sequelize_2.Op.between]: [start, end],
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
                startDate: { [sequelize_2.Op.lte]: end },
                endDate: { [sequelize_2.Op.gte]: start },
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
};
exports.SalesmanService = SalesmanService;
exports.SalesmanService = SalesmanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(salesman_model_1.Salesman)),
    __param(1, (0, sequelize_1.InjectModel)(beat_model_1.Beat)),
    __param(2, (0, sequelize_1.InjectModel)(store_model_1.Store)),
    __param(3, (0, sequelize_1.InjectModel)(visit_model_1.Visit)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SalesmanService);
