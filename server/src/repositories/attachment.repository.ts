import { Op } from 'sequelize';
import { Attachment } from '../models/attachment.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';

type AttachmentAttributes = {
  id: string;
  orderId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  type: 'signature' | 'delivery_proof' | 'return_proof';
  notes: string | null;
  created_at: Date;
  updatedAt: Date;
};

type CreateAttachmentData = Omit<AttachmentAttributes, 'id' | 'created_at' | 'updatedAt'>;

class AttachmentRepository {
  private static instance: AttachmentRepository;
  
  private constructor() {}
  
  public static getInstance(): AttachmentRepository {
    if (!AttachmentRepository.instance) {
      AttachmentRepository.instance = new AttachmentRepository();
    }
    return AttachmentRepository.instance;
  }

  async create(attachmentData: CreateAttachmentData): Promise<Attachment> {
    const attachment = new Attachment();
    Object.assign(attachment, attachmentData);
    return await attachment.save();
  }

  async findById(id: string, includeRelations: boolean = true): Promise<Attachment | null> {
    const options: any = { where: { id } };
    
    if (includeRelations) {
      options.include = [
        { model: Order, as: 'order' },
        { model: User, as: 'uploadedBy' }
      ];
    }
    
    return await Attachment.findByPk(id, options);
  }

  async findByOrder(orderId: string, type?: AttachmentAttributes['type']): Promise<Attachment[]> {
    const where: any = { orderId };
    if (type) where.type = type;
    
    return await Attachment.findAll({
      where,
      include: [
        { model: User, as: 'uploadedBy' }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findByUploader(uploadedById: string, limit: number = 10, offset: number = 0): Promise<{ rows: Attachment[]; count: number }> {
    return await Attachment.findAndCountAll({
      where: { uploadedById },
      include: [
        { model: Order, as: 'order' }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  async update(
    id: string, 
    updateData: Partial<Omit<AttachmentAttributes, 'id' | 'orderId' | 'uploadedById' | 'created_at' | 'updatedAt'>>
  ): Promise<[number, Attachment[]]> {
    // Use type assertion to handle the notes field
    const updateValues: any = { ...updateData };
    if ('notes' in updateValues && updateValues.notes === null) {
      updateValues.notes = null;
    }
    
    return await Attachment.update(updateValues, {
      where: { id },
      returning: true
    });
  }

  async delete(id: string): Promise<number> {
    return await Attachment.destroy({
      where: { id }
    });
  }

  async deleteByOrder(orderId: string, type?: AttachmentAttributes['type']): Promise<number> {
    const where: any = { orderId };
    if (type) where.type = type;
    
    return await Attachment.destroy({ where });
  }

  async getOrderAttachments(orderId: string): Promise<{
    signature: Attachment | null;
    deliveryProof: Attachment | null;
    returnProof: Attachment | null;
    other: Attachment[];
  }> {
    const attachments = await Attachment.findAll({
      where: { orderId },
      order: [['created_at', 'DESC']]
    });

    const result = {
      signature: null as Attachment | null,
      deliveryProof: null as Attachment | null,
      returnProof: null as Attachment | null,
      other: [] as Attachment[]
    };

    attachments.forEach(attachment => {
      switch (attachment.type) {
        case 'signature':
          if (!result.signature) result.signature = attachment;
          break;
        case 'delivery_proof':
          if (!result.deliveryProof) result.deliveryProof = attachment;
          break;
        case 'return_proof':
          if (!result.returnProof) result.returnProof = attachment;
          break;
        default:
          result.other.push(attachment);
      }
    });

    return result;
  }

  async getAttachmentsStats(uploadedById?: string): Promise<{
    total: number;
    byType: {
      signature: number;
      delivery_proof: number;
      return_proof: number;
    };
    recentUploads: Attachment[];
  }> {
    const where: any = {};
    if (uploadedById) where.uploadedById = uploadedById;

    const [total, signatureCount, deliveryProofCount, returnProofCount, recentUploads] = await Promise.all([
      Attachment.count({ where }),
      Attachment.count({ where: { ...where, type: 'signature' } }),
      Attachment.count({ where: { ...where, type: 'delivery_proof' } }),
      Attachment.count({ where: { ...where, type: 'return_proof' } }),
      Attachment.findAll({
        where,
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          { model: Order, as: 'order' },
          { model: User, as: 'uploadedBy' }
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

export default AttachmentRepository.getInstance();
