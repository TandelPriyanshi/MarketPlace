"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attachment_model_1 = require("../models/attachment.model");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
class AttachmentRepository {
    constructor() { }
    static getInstance() {
        if (!AttachmentRepository.instance) {
            AttachmentRepository.instance = new AttachmentRepository();
        }
        return AttachmentRepository.instance;
    }
    async create(attachmentData) {
        const attachment = new attachment_model_1.Attachment();
        Object.assign(attachment, attachmentData);
        return await attachment.save();
    }
    async findById(id, includeRelations = true) {
        const options = { where: { id } };
        if (includeRelations) {
            options.include = [
                { model: order_model_1.Order, as: 'order' },
                { model: user_model_1.User, as: 'uploadedBy' }
            ];
        }
        return await attachment_model_1.Attachment.findByPk(id, options);
    }
    async findByOrder(orderId, type) {
        const where = { orderId };
        if (type)
            where.type = type;
        return await attachment_model_1.Attachment.findAll({
            where,
            include: [
                { model: user_model_1.User, as: 'uploadedBy' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
    async findByUploader(uploadedById, limit = 10, offset = 0) {
        return await attachment_model_1.Attachment.findAndCountAll({
            where: { uploadedById },
            include: [
                { model: order_model_1.Order, as: 'order' }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    async update(id, updateData) {
        // Use type assertion to handle the notes field
        const updateValues = { ...updateData };
        if ('notes' in updateValues && updateValues.notes === null) {
            updateValues.notes = null;
        }
        return await attachment_model_1.Attachment.update(updateValues, {
            where: { id },
            returning: true
        });
    }
    async delete(id) {
        return await attachment_model_1.Attachment.destroy({
            where: { id }
        });
    }
    async deleteByOrder(orderId, type) {
        const where = { orderId };
        if (type)
            where.type = type;
        return await attachment_model_1.Attachment.destroy({ where });
    }
    async getOrderAttachments(orderId) {
        const attachments = await attachment_model_1.Attachment.findAll({
            where: { orderId },
            order: [['createdAt', 'DESC']]
        });
        const result = {
            signature: null,
            deliveryProof: null,
            returnProof: null,
            other: []
        };
        attachments.forEach(attachment => {
            switch (attachment.type) {
                case 'signature':
                    if (!result.signature)
                        result.signature = attachment;
                    break;
                case 'delivery_proof':
                    if (!result.deliveryProof)
                        result.deliveryProof = attachment;
                    break;
                case 'return_proof':
                    if (!result.returnProof)
                        result.returnProof = attachment;
                    break;
                default:
                    result.other.push(attachment);
            }
        });
        return result;
    }
    async getAttachmentsStats(uploadedById) {
        const where = {};
        if (uploadedById)
            where.uploadedById = uploadedById;
        const [total, signatureCount, deliveryProofCount, returnProofCount, recentUploads] = await Promise.all([
            attachment_model_1.Attachment.count({ where }),
            attachment_model_1.Attachment.count({ where: { ...where, type: 'signature' } }),
            attachment_model_1.Attachment.count({ where: { ...where, type: 'delivery_proof' } }),
            attachment_model_1.Attachment.count({ where: { ...where, type: 'return_proof' } }),
            attachment_model_1.Attachment.findAll({
                where,
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: order_model_1.Order, as: 'order' },
                    { model: user_model_1.User, as: 'uploadedBy' }
                ]
            })
        ]);
        return {
            total,
            byType: {
                signature: signatureCount,
                delivery_proof: deliveryProofCount,
                return_proof: returnProofCount
            },
            recentUploads
        };
    }
}
exports.default = AttachmentRepository.getInstance();
