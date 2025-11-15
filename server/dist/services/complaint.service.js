"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complaintService = void 0;
const complaint_model_1 = require("../models/complaint.model");
const user_model_1 = require("../models/user.model");
const order_model_1 = require("../models/order.model");
const db_1 = require("../db");
const errors_1 = require("../utils/errors");
class ComplaintService {
    /**
     * Create a new complaint
     */
    async createComplaint(complaintData) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Validate required fields
            if (!complaintData.userId || !complaintData.type || !complaintData.title || !complaintData.description) {
                throw new errors_1.ValidationError('Missing required fields');
            }
            // If orderId is provided, validate the order exists and belongs to the user
            if (complaintData.orderId) {
                const order = await order_model_1.Order.findOne({
                    where: { id: complaintData.orderId, userId: complaintData.userId },
                    transaction
                });
                if (!order) {
                    throw new errors_1.ValidationError('Order not found or access denied');
                }
            }
            // Create the complaint
            const complaint = await complaint_model_1.Complaint.create({
                ...complaintData,
                status: complaint_model_1.ComplaintStatus.OPEN,
                attachments: complaintData.attachments || [],
            }, { transaction });
            await transaction.commit();
            return complaint.reload({
                include: [
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                    { model: order_model_1.Order, as: 'order', attributes: ['id', 'orderNumber'] }
                ]
            });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to create complaint', error);
            }
            throw new errors_1.DatabaseError('Failed to create complaint', new Error(String(error)));
        }
    }
    /**
     * Get complaint by ID with access control
     */
    async getComplaintById(complaintId, userId, userRole) {
        const where = { id: complaintId };
        // Regular users can only see their own complaints
        // Admins/salesmansalesman can see all complaints
        if (userRole !== user_model_1.UserRole.ADMIN && userRole !== user_model_1.UserRole.SALESMAN) {
            where.userId = userId;
        }
        const complaint = await complaint_model_1.Complaint.findOne({
            where,
            include: [
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: user_model_1.User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
                { model: order_model_1.Order, as: 'order', attributes: ['id', 'orderNumber'] }
            ]
        });
        if (!complaint) {
            throw new errors_1.NotFoundError('Complaint not found or access denied');
        }
        return complaint;
    }
    /**
     * List complaints with filters and pagination
     */
    async listComplaints({ page = 1, limit = 10, status, type, userId, orderId, userRole, currentUserId }) {
        const where = {};
        // Apply filters
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (orderId)
            where.orderId = orderId;
        // Regular users can only see their own complaints
        // Admins/salesman can see all complaints or filter by user
        if (userRole !== user_model_1.UserRole.ADMIN && userRole !== user_model_1.UserRole.SALESMAN) {
            where.userId = currentUserId;
        }
        else if (userId) {
            where.userId = userId;
        }
        const { count, rows } = await complaint_model_1.Complaint.findAndCountAll({
            where,
            include: [
                { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: order_model_1.Order, as: 'order', attributes: ['id', 'orderNumber'] }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
        return {
            complaints: rows,
            total: count
        };
    }
    /**
     * Update complaint status and add resolution notes
     */
    async updateComplaint(complaintId, updateData, userId, userRole) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Find the complaint
            const complaint = await complaint_model_1.Complaint.findByPk(complaintId, { transaction });
            if (!complaint) {
                throw new errors_1.NotFoundError('Complaint not found');
            }
            // Check permissions
            if (userRole !== user_model_1.UserRole.ADMIN &&
                userRole !== user_model_1.UserRole.SALESMAN &&
                complaint.userId !== userId) {
                throw new errors_1.ForbiddenError('Not authorized to update this complaint');
            }
            // Prepare update data
            const updatePayload = {};
            // Only admins/salesman can change status and resolution notes
            if (userRole === user_model_1.UserRole.ADMIN || userRole === user_model_1.UserRole.SALESMAN) {
                if (updateData.status) {
                    // Validate status transition
                    const validTransitions = this.getValidStatusTransitions(complaint.status);
                    if (!validTransitions.includes(updateData.status)) {
                        throw new errors_1.ValidationError(`Invalid status transition from ${complaint.status} to ${updateData.status}`);
                    }
                    updatePayload.status = updateData.status;
                    // Set resolved info if status is being changed to RESOLVED or CLOSED
                    if ((updateData.status === complaint_model_1.ComplaintStatus.RESOLVED ||
                        updateData.status === complaint_model_1.ComplaintStatus.CLOSED) &&
                        !complaint.resolvedAt) {
                        updatePayload.resolvedById = userId;
                        updatePayload.resolvedAt = new Date();
                    }
                }
                if (updateData.resolutionNotes !== undefined) {
                    updatePayload.resolutionNotes = updateData.resolutionNotes;
                }
            }
            // Users can only add attachments to their open complaints
            if (updateData.attachments && updateData.attachments.length > 0) {
                if (complaint.userId === userId && complaint.status === complaint_model_1.ComplaintStatus.OPEN) {
                    updatePayload.attachments = [
                        ...(complaint.attachments || []),
                        ...updateData.attachments
                    ];
                }
                else if (userRole !== user_model_1.UserRole.ADMIN && userRole !== user_model_1.UserRole.SALESMAN) {
                    throw new errors_1.ForbiddenError('Cannot add attachments to this complaint');
                }
            }
            // Update the complaint
            await complaint.update(updatePayload, { transaction });
            await transaction.commit();
            return complaint.reload({
                include: [
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] },
                    { model: user_model_1.User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
                    { model: order_model_1.Order, as: 'order', attributes: ['id', 'orderNumber'] }
                ]
            });
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to update complaint', error);
            }
            throw new errors_1.DatabaseError('Failed to update complaint', new Error(String(error)));
        }
    }
    /**
     * Get valid status transitions based on current status
     */
    getValidStatusTransitions(currentStatus) {
        const statusTransitions = {
            [complaint_model_1.ComplaintStatus.OPEN]: [
                complaint_model_1.ComplaintStatus.IN_PROGRESS,
                complaint_model_1.ComplaintStatus.RESOLVED,
                complaint_model_1.ComplaintStatus.CLOSED,
                complaint_model_1.ComplaintStatus.REJECTED
            ],
            [complaint_model_1.ComplaintStatus.IN_PROGRESS]: [
                complaint_model_1.ComplaintStatus.RESOLVED,
                complaint_model_1.ComplaintStatus.CLOSED,
                complaint_model_1.ComplaintStatus.REJECTED
            ],
            [complaint_model_1.ComplaintStatus.RESOLVED]: [
                complaint_model_1.ComplaintStatus.CLOSED,
                complaint_model_1.ComplaintStatus.REOPENED
            ],
            [complaint_model_1.ComplaintStatus.REOPENED]: [
                complaint_model_1.ComplaintStatus.IN_PROGRESS,
                complaint_model_1.ComplaintStatus.RESOLVED,
                complaint_model_1.ComplaintStatus.CLOSED,
                complaint_model_1.ComplaintStatus.REJECTED
            ],
            [complaint_model_1.ComplaintStatus.REJECTED]: [
                complaint_model_1.ComplaintStatus.REOPENED
            ],
            [complaint_model_1.ComplaintStatus.CLOSED]: []
        };
        return statusTransitions[currentStatus] || [];
    }
    /**
     * Get complaint statistics
     */
    async getComplaintStats(userId, userRole) {
        const where = {};
        // Regular users can only see their own stats
        if (userRole !== user_model_1.UserRole.ADMIN && userRole !== user_model_1.UserRole.SALESMAN) {
            where.userId = userId;
        }
        const [total, open, inProgress, resolved, closed, rejected, byTypeResult, recent] = await Promise.all([
            complaint_model_1.Complaint.count({ where }),
            complaint_model_1.Complaint.count({ where: { ...where, status: complaint_model_1.ComplaintStatus.OPEN } }),
            complaint_model_1.Complaint.count({ where: { ...where, status: complaint_model_1.ComplaintStatus.IN_PROGRESS } }),
            complaint_model_1.Complaint.count({ where: { ...where, status: complaint_model_1.ComplaintStatus.RESOLVED } }),
            complaint_model_1.Complaint.count({ where: { ...where, status: complaint_model_1.ComplaintStatus.CLOSED } }),
            complaint_model_1.Complaint.count({ where: { ...where, status: complaint_model_1.ComplaintStatus.REJECTED } }),
            (async () => {
                const types = Object.values(complaint_model_1.ComplaintType);
                const counts = await Promise.all(types.map(type => complaint_model_1.Complaint.count({
                    where: { ...where, type }
                })
                    .then(count => ({ type, count }))));
                return counts.reduce((acc, { type, count }) => ({
                    ...acc,
                    [type]: count
                }), {});
            })(),
            complaint_model_1.Complaint.findAll({
                where,
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: user_model_1.User, as: 'user', attributes: ['id', 'name', 'email'] }
                ]
            })
        ]);
        return {
            total,
            open,
            inProgress,
            resolved,
            closed,
            rejected,
            byType: byTypeResult,
            recent
        };
    }
    /**
     * Create complaint with file uploads (public wrapper)
     */
    async createComplaintWithFiles(userId, complaintData, files) {
        const transaction = await db_1.sequelize.transaction();
        try {
            // Handle file uploads
            const attachments = complaintData.attachments || [];
            if (files && files.length > 0) {
                // Process file uploads (simplified - should use proper file storage)
                for (const file of files) {
                    // In production, upload to S3 or similar
                    attachments.push(`/uploads/complaints/${file.filename}`);
                }
            }
            return await this.createComplaint({
                userId,
                orderId: complaintData.orderId,
                type: complaintData.type,
                title: complaintData.title,
                description: complaintData.description,
                attachments,
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    /**
     * Get user complaints with pagination
     */
    async getUserComplaints(userId, options) {
        const { page = 1, limit = 10, status } = options;
        const result = await this.listComplaints({
            page,
            limit,
            status: status,
            currentUserId: userId,
        });
        return {
            complaints: result.complaints,
            pagination: {
                total: result.total,
                page,
                totalPages: Math.ceil(result.total / limit),
                limit,
            },
        };
    }
    /**
     * Update complaint status (wrapper for updateComplaint)
     */
    async updateComplaintStatus(complaintId, status, resolutionNotes) {
        return await this.updateComplaint(complaintId, { status, resolutionNotes }, undefined, user_model_1.UserRole.ADMIN // Assuming admin is updating
        );
    }
    /**
     * Add attachment to complaint
     */
    async addAttachment(complaintId, userId, userRole, filePath) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const complaint = await complaint_model_1.Complaint.findByPk(complaintId, { transaction });
            if (!complaint) {
                throw new errors_1.NotFoundError('Complaint not found');
            }
            // Check permissions
            if (userRole !== user_model_1.UserRole.ADMIN &&
                userRole !== user_model_1.UserRole.SALESMAN &&
                complaint.userId !== userId) {
                throw new errors_1.ForbiddenError('Not authorized to add attachments to this complaint');
            }
            // Only allow adding attachments to open or in-progress complaints
            if (userRole !== user_model_1.UserRole.ADMIN &&
                userRole !== user_model_1.UserRole.SALESMAN &&
                complaint.status !== complaint_model_1.ComplaintStatus.OPEN &&
                complaint.status !== complaint_model_1.ComplaintStatus.IN_PROGRESS) {
                throw new errors_1.ValidationError('Cannot add attachments to a closed or resolved complaint');
            }
            // Add the new attachment
            const attachments = [...(complaint.attachments || []), filePath];
            await complaint.update({ attachments }, { transaction });
            await transaction.commit();
            return complaint.reload();
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ForbiddenError ||
                error instanceof errors_1.ValidationError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new errors_1.DatabaseError('Failed to add attachment', error);
            }
            throw new errors_1.DatabaseError('Failed to add attachment', new Error(String(error)));
        }
    }
}
exports.complaintService = new ComplaintService();
