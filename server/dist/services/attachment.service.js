"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const attachment_model_1 = require("../models/attachment.model");
const user_model_1 = require("../models/user.model");
const complaint_model_1 = require("../models/complaint.model");
const order_model_1 = require("../models/order.model");
const db_1 = require("../db");
const errors_1 = require("../utils/errors");
// Ensure upload directory exists
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
class AttachmentService {
    /**
     * Create a new attachment
     */
    async createAttachment(attachmentData) {
        const transaction = await db_1.sequelize.transaction();
        const { userId, type, referenceId, file, metadata } = attachmentData;
        try {
            // Validate file
            if (!file || !file.buffer || file.size === 0) {
                throw new errors_1.ValidationError('Invalid file');
            }
            // Validate file size (max 5MB)
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_FILE_SIZE) {
                throw new errors_1.ValidationError('File size exceeds the maximum allowed limit of 5MB');
            }
            // Create a unique filename
            const fileExt = path_1.default.extname(file.originalname);
            const filename = `${(0, uuid_1.v4)()}${fileExt}`;
            const fullPath = path_1.default.join(UPLOAD_DIR, filename);
            // Write file to disk
            await fs_1.default.promises.writeFile(fullPath, file.buffer);
            // Create attachment record
            const attachment = await attachment_model_1.Attachment.create({
                uploadedById: userId,
                orderId: type === 'order' ? referenceId : undefined,
                type,
                fileName: filename,
                filePath: filename,
                mimeType: file.mimetype,
                size: file.size,
                originalName: file.originalname,
                metadata: metadata || {}
            }, // Using type assertion as a temporary fix for type mismatch
            { transaction });
            await transaction.commit();
            return attachment;
        }
        catch (error) {
            await transaction.rollback();
            // Clean up file if it was created
            if (file?.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            throw new errors_1.DatabaseError('Failed to create attachment', error);
        }
    }
    /**
     * Get attachment by ID with access control
     */
    async getAttachmentById(attachmentId, userId, userRole) {
        const attachment = await attachment_model_1.Attachment.findByPk(attachmentId);
        if (!attachment) {
            throw new errors_1.NotFoundError('Attachment not found');
        }
        // Check access based on attachment type
        await this.validateReferenceAccess(attachment.type, attachment.referenceId || '', userId, undefined, userRole);
        return attachment;
    }
    /**
     * Get file stream for downloading
     */
    async getFileStream(attachmentId, userId, userRole) {
        const attachment = await this.getAttachmentById(attachmentId, userId, userRole);
        const filePath = path_1.default.join(UPLOAD_DIR, attachment.filePath);
        if (!fs_1.default.existsSync(filePath)) {
            throw new errors_1.NotFoundError('File not found');
        }
        return {
            stream: fs_1.default.createReadStream(filePath),
            filename: attachment.originalName || attachment.fileName,
            mimeType: attachment.mimeType,
            size: attachment.size
        };
    }
    /**
     * List attachments with filters
     */
    async listAttachments({ type, referenceId, userId, userRole, page = 1, limit = 10 }) {
        const where = {};
        if (type)
            where.type = type;
        if (referenceId)
            where.referenceId = referenceId;
        // Regular users can only see their own attachments
        // Admins can see all attachments
        if (userRole !== 'admin') {
            where.userId = userId;
        }
        const { count, rows } = await attachment_model_1.Attachment.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']],
            include: [
                { model: user_model_1.User, as: 'uploadedBy', attributes: ['id', 'name', 'email'] }
            ]
        });
        return {
            attachments: rows,
            total: count
        };
    }
    /**
     * Delete an attachment
     */
    async deleteAttachment(attachmentId, userId, userRole) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const attachment = await attachment_model_1.Attachment.findByPk(attachmentId, { transaction });
            if (!attachment) {
                throw new errors_1.NotFoundError('Attachment not found');
            }
            // Check permissions
            if (userRole !== 'admin' && attachment.userId !== userId) {
                throw new errors_1.ForbiddenError('Not authorized to delete this attachment');
            }
            // Delete file from disk
            const filePath = path_1.default.join(UPLOAD_DIR, attachment.filePath);
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
            }
            // Delete attachment record
            await attachment.destroy({ transaction });
            await transaction.commit();
            return true;
        }
        catch (error) {
            await transaction.rollback();
            if (error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            throw new errors_1.DatabaseError('Failed to delete attachment', error);
        }
    }
    /**
     * Delete all attachments for a reference
     */
    async deleteAttachmentsByReference(type, referenceId, userId, userRole) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const where = { type, referenceId };
            // Regular users can only delete their own attachments
            if (userRole !== 'admin') {
                where.userId = userId;
            }
            const attachments = await attachment_model_1.Attachment.findAll({ where, transaction });
            // Delete files from disk
            await Promise.all(attachments.map(attachment => {
                const filePath = path_1.default.join(UPLOAD_DIR, attachment.filePath);
                if (fs_1.default.existsSync(filePath)) {
                    return fs_1.default.promises.unlink(filePath);
                }
                return Promise.resolve();
            }));
            // Delete attachment records
            const count = await attachment_model_1.Attachment.destroy({ where, transaction });
            await transaction.commit();
            return count;
        }
        catch (error) {
            await transaction.rollback();
            throw new errors_1.DatabaseError('Failed to delete attachments', error);
        }
    }
    /**
     * Validate that the user has access to the reference
     */
    async validateReferenceAccess(type, referenceId, userId, transaction, userRole) {
        if (!userId && userRole !== 'admin') {
            throw new errors_1.ForbiddenError('Authentication required');
        }
        switch (type) {
            case 'complaint':
            case 'signature':
            case 'delivery_proof':
            case 'return_proof': {
                const complaint = await complaint_model_1.Complaint.findByPk(referenceId, { transaction });
                if (!complaint) {
                    throw new errors_1.NotFoundError('Reference not found');
                }
                // Only the complaint owner or salesman can add attachments
                if (complaint.userId !== userId && userRole !== 'salesman') {
                    throw new errors_1.ForbiddenError('Not authorized to add attachments to this complaint');
                }
                // Only allow adding attachments to open or in-progress complaints
                if (userRole !== 'salesman' &&
                    complaint.status !== 'open' &&
                    complaint.status !== 'in_progress') {
                    throw new errors_1.ValidationError('Cannot add attachments to a closed or resolved complaint');
                }
                break;
            }
            case 'order': {
                const order = await order_model_1.Order.findByPk(referenceId, { transaction });
                if (!order) {
                    throw new errors_1.NotFoundError('Order not found');
                }
                // Only the order owner or admin can add attachments
                if (order.userId !== userId && userRole !== 'admin') {
                    throw new errors_1.ForbiddenError('Not authorized to add attachments to this order');
                }
                break;
            }
            case 'profile': {
                // Only the user themselves or admin can add profile attachments
                if (referenceId !== userId && userRole !== 'admin') {
                    throw new errors_1.ForbiddenError('Not authorized to add attachments to this profile');
                }
                break;
            }
            default:
                throw new errors_1.ValidationError('Invalid attachment type');
        }
    }
    /**
     * Clean up orphaned files (attachments that exist in the filesystem but not in the database)
     */
    async cleanupOrphanedFiles() {
        const deleted = [];
        const errors = [];
        try {
            // Get all attachment paths from the database
            const attachments = await attachment_model_1.Attachment.findAll({
                attributes: ['filePath']
            });
            const dbPaths = new Set(attachments.map(a => a.filePath).filter((p) => !!p));
            // Get all files in the upload directory
            const files = await fs_1.default.promises.readdir(UPLOAD_DIR);
            // Find and delete orphaned files
            await Promise.all(files.map(async (file) => {
                if (!dbPaths.has(file)) {
                    try {
                        const filePath = path_1.default.join(UPLOAD_DIR, file);
                        await fs_1.default.promises.unlink(filePath);
                        deleted.push(file);
                    }
                    catch (error) {
                        errors.push(`Failed to delete ${file}: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }));
            return { deleted, errors };
        }
        catch (error) {
            errors.push(`Failed to clean up orphaned files: ${error instanceof Error ? error.message : String(error)}`);
            return { deleted, errors };
        }
    }
}
exports.attachmentService = new AttachmentService();
