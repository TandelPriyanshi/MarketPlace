"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const complaint_model_1 = require("../models/complaint.model");
const user_model_1 = require("../models/user.model");
const order_model_1 = require("../models/order.model");
class ComplaintRepository {
    constructor() { }
    static getInstance() {
        if (!ComplaintRepository.instance) {
            ComplaintRepository.instance = new ComplaintRepository();
        }
        return ComplaintRepository.instance;
    }
    async create(complaintData) {
        const complaint = new complaint_model_1.Complaint();
        Object.assign(complaint, {
            ...complaintData,
            status: complaint_model_1.ComplaintStatus.OPEN,
            attachments: complaintData.attachments || [],
            resolutionNotes: null,
            resolvedById: null,
            resolvedAt: null
        });
        return await complaint.save();
    }
    async findById(id, includeRelations = true) {
        const options = { where: { id } };
        if (includeRelations) {
            options.include = [
                { model: user_model_1.User, as: 'user' },
                { model: user_model_1.User, as: 'resolvedBy' },
                { model: order_model_1.Order, as: 'order' }
            ];
        }
        return await complaint_model_1.Complaint.findByPk(id, options);
    }
    async findByUser(userId, limit = 10, offset = 0) {
        return await complaint_model_1.Complaint.findAndCountAll({
            where: { userId },
            include: [
                { model: order_model_1.Order, as: 'order' },
                { model: user_model_1.User, as: 'resolvedBy' }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    async findByOrder(orderId) {
        return await complaint_model_1.Complaint.findAll({
            where: { orderId },
            include: [
                { model: user_model_1.User, as: 'user' },
                { model: user_model_1.User, as: 'resolvedBy' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async findAll(limit = 10, offset = 0, filter) {
        const where = {};
        if (filter) {
            if (filter.status)
                where.status = filter.status;
            if (filter.type)
                where.type = filter.type;
            if (filter.userId)
                where.userId = filter.userId;
            if (filter.orderId)
                where.orderId = filter.orderId;
            if (filter.resolvedById !== undefined)
                where.resolvedById = filter.resolvedById;
            if (filter.startDate || filter.endDate) {
                where.createdAt = {};
                if (filter.startDate)
                    where.createdAt[sequelize_1.Op.gte] = filter.startDate;
                if (filter.endDate)
                    where.createdAt[sequelize_1.Op.lte] = filter.endDate;
            }
        }
        return await complaint_model_1.Complaint.findAndCountAll({
            where,
            include: [
                { model: user_model_1.User, as: 'user' },
                { model: user_model_1.User, as: 'resolvedBy' },
                { model: order_model_1.Order, as: 'order' }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    async updateStatus(id, status, resolvedById, resolutionNotes) {
        const updateData = { status };
        if (status === complaint_model_1.ComplaintStatus.RESOLVED || status === complaint_model_1.ComplaintStatus.CLOSED) {
            updateData.resolvedById = resolvedById || null;
            updateData.resolvedAt = new Date();
            if (resolutionNotes) {
                updateData.resolutionNotes = resolutionNotes;
            }
        }
        else if (status === complaint_model_1.ComplaintStatus.REJECTED) {
            updateData.resolvedById = resolvedById || null;
            updateData.resolvedAt = new Date();
            updateData.resolutionNotes = resolutionNotes || 'Complaint rejected';
        }
        return await complaint_model_1.Complaint.update(updateData, {
            where: { id },
            returning: true
        });
    }
    async addAttachment(complaintId, filePath) {
        const complaint = await complaint_model_1.Complaint.findByPk(complaintId);
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        const attachments = [...(complaint.attachments || []), filePath];
        return await complaint_model_1.Complaint.update({ attachments }, {
            where: { id: complaintId },
            returning: true
        });
    }
    async getStats() {
        const [total, open, inProgress, resolved, rejected, closed, byType] = await Promise.all([
            complaint_model_1.Complaint.count(),
            complaint_model_1.Complaint.count({ where: { status: complaint_model_1.ComplaintStatus.OPEN } }),
            complaint_model_1.Complaint.count({ where: { status: complaint_model_1.ComplaintStatus.IN_PROGRESS } }),
            complaint_model_1.Complaint.count({ where: { status: complaint_model_1.ComplaintStatus.RESOLVED } }),
            complaint_model_1.Complaint.count({ where: { status: complaint_model_1.ComplaintStatus.REJECTED } }),
            complaint_model_1.Complaint.count({ where: { status: complaint_model_1.ComplaintStatus.CLOSED } }),
            (async () => {
                const types = Object.values(complaint_model_1.ComplaintType);
                const counts = await Promise.all(types.map(type => complaint_model_1.Complaint.count({ where: { type } })
                    .then(count => ({ type, count }))));
                return counts.reduce((acc, { type, count }) => ({
                    ...acc,
                    [type]: count
                }), {});
            })()
        ]);
        return {
            total,
            open,
            inProgress,
            resolved,
            rejected,
            closed,
            byType
        };
    }
}
exports.default = ComplaintRepository.getInstance();
