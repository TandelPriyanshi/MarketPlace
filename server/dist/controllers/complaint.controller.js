"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintController = exports.ComplaintController = void 0;
const complaint_service_1 = require("../services/complaint.service");
const logger_1 = require("../utils/logger");
class ComplaintController {
    async createComplaint(req, res, next) {
        try {
            const userId = req.user.id;
            const files = req.files;
            const complaint = await complaint_service_1.complaintService.createComplaintWithFiles(userId, req.body, files);
            res.status(201).json({
                success: true,
                data: complaint,
                message: 'Complaint submitted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createComplaint controller:', error);
            next(error);
        }
    }
    async getComplaints(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit, status } = req.query;
            const result = await complaint_service_1.complaintService.getUserComplaints(userId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                status: status,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getComplaints controller:', error);
            next(error);
        }
    }
    async getComplaintById(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const complaint = await complaint_service_1.complaintService.getComplaintById(userId, id);
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
        }
        catch (error) {
            logger_1.logger.error('Error in getComplaintById controller:', error);
            next(error);
        }
    }
    async updateComplaintStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, resolutionNotes } = req.body;
            const complaint = await complaint_service_1.complaintService.updateComplaintStatus(id, status, resolutionNotes);
            res.json({
                success: true,
                data: complaint,
                message: 'Complaint status updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateComplaintStatus controller:', error);
            next(error);
        }
    }
}
exports.ComplaintController = ComplaintController;
exports.complaintController = new ComplaintController();
