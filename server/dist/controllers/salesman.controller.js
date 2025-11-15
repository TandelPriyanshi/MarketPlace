"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesmanController = exports.SalesmanController = void 0;
const logger_1 = require("../utils/logger");
const beat_model_1 = require("../models/beat.model");
const visit_model_1 = require("../models/visit.model");
class SalesmanController {
    async createBeat(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const beat = await beat_model_1.Beat.create({
                ...req.body,
                salesmanId,
            });
            res.status(201).json({
                success: true,
                data: beat,
                message: 'Beat created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createBeat controller:', error);
            next(error);
        }
    }
    async getBeats(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const beats = await beat_model_1.Beat.findAll({
                where: { salesmanId },
                order: [['createdAt', 'DESC']],
            });
            res.json({
                success: true,
                data: beats,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getBeats controller:', error);
            next(error);
        }
    }
    async getBeatById(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { id } = req.params;
            const beat = await beat_model_1.Beat.findOne({
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
        }
        catch (error) {
            logger_1.logger.error('Error in getBeatById controller:', error);
            next(error);
        }
    }
    async createVisit(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const visit = await visit_model_1.Visit.create({
                ...req.body,
                salesmanId,
                status: 'scheduled',
            });
            res.status(201).json({
                success: true,
                data: visit,
                message: 'Visit created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createVisit controller:', error);
            next(error);
        }
    }
    async getVisits(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { status, storeId } = req.query;
            const where = { salesmanId };
            if (status)
                where.status = status;
            if (storeId)
                where.storeId = storeId;
            const visits = await visit_model_1.Visit.findAll({
                where,
                order: [['scheduledAt', 'DESC']],
            });
            res.json({
                success: true,
                data: visits,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getVisits controller:', error);
            next(error);
        }
    }
    async getVisitById(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { id } = req.params;
            const visit = await visit_model_1.Visit.findOne({
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
        }
        catch (error) {
            logger_1.logger.error('Error in getVisitById controller:', error);
            next(error);
        }
    }
    async updateVisitStatus(req, res, next) {
        try {
            const salesmanId = req.user.id;
            const { id } = req.params;
            const { status, checkIn, checkOut } = req.body;
            const visit = await visit_model_1.Visit.findOne({
                where: { id, salesmanId },
            });
            if (!visit) {
                return res.status(404).json({
                    success: false,
                    message: 'Visit not found',
                });
            }
            const updateData = { status };
            if (status === 'in_progress' && visit.status === 'scheduled') {
                updateData.startedAt = new Date();
                if (checkIn)
                    updateData.checkIn = checkIn;
            }
            if (status === 'completed' && visit.status !== 'completed') {
                updateData.completedAt = new Date();
                if (checkOut)
                    updateData.checkOut = checkOut;
            }
            await visit.update(updateData);
            res.json({
                success: true,
                data: visit,
                message: 'Visit status updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateVisitStatus controller:', error);
            next(error);
        }
    }
}
exports.SalesmanController = SalesmanController;
exports.salesmanController = new SalesmanController();
