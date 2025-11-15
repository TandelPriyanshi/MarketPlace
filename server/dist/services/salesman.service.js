"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const beat_model_1 = require("../models/beat.model");
const store_model_1 = require("../models/store.model");
const visit_model_1 = require("../models/visit.model");
const logger_1 = require("../utils/logger");
class SalesmanService {
    async getSalesmanBeats(salesmanId) {
        try {
            return await beat_model_1.Beat.findAll({
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
        catch (error) {
            logger_1.logger.error('Error fetching salesman beats:', error);
            throw error;
        }
    }
    async createBeat(salesmanId, beatData) {
        try {
            const beat = await beat_model_1.Beat.create({
                ...beatData,
                salesmanId,
            });
            return await beat_model_1.Beat.findByPk(beat.id, {
                include: [store_model_1.Store],
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating beat:', error);
            throw error;
        }
    }
    async logVisit(salesmanId, visitData) {
        try {
            return await visit_model_1.Visit.create({
                ...visitData,
                salesmanId,
                status: visit_model_1.VisitStatus.SCHEDULED,
            });
        }
        catch (error) {
            logger_1.logger.error('Error logging visit:', error);
            throw error;
        }
    }
    async updateVisit(visitId, salesmanId, updateData) {
        try {
            const visit = await visit_model_1.Visit.findOne({
                where: { id: visitId, salesmanId },
            });
            if (!visit) {
                throw new Error('Visit not found');
            }
            const updatePayload = { ...updateData };
            if (updateData.status === visit_model_1.VisitStatus.IN_PROGRESS && visit.status === visit_model_1.VisitStatus.SCHEDULED) {
                updatePayload.startedAt = new Date();
            }
            if (updateData.status === visit_model_1.VisitStatus.COMPLETED && visit.status !== visit_model_1.VisitStatus.COMPLETED) {
                updatePayload.completedAt = new Date();
            }
            await visit.update(updatePayload);
            return visit.reload();
        }
        catch (error) {
            logger_1.logger.error('Error updating visit:', error);
            throw error;
        }
    }
    async getVisits(salesmanId, filters = {}) {
        try {
            const where = { salesmanId };
            if (filters.status)
                where.status = filters.status;
            if (filters.storeId)
                where.storeId = filters.storeId;
            return await visit_model_1.Visit.findAll({
                where,
                include: [
                    {
                        model: store_model_1.Store,
                        attributes: ['id', 'name', 'address', 'contactPerson', 'phone'],
                    },
                ],
                order: [['scheduledAt', 'DESC']],
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching visits:', error);
            throw error;
        }
    }
}
exports.default = new SalesmanService();
