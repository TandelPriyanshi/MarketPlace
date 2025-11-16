import { Op, Transaction } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Attachment, AttachmentType } from '../models/attachment.model';
import { User, UserRole } from '../models/user.model';
import { Complaint } from '../models/complaint.model';
import { Order } from '../models/order.model';
import { sequelize } from '../db';
import { NotFoundError, ValidationError, DatabaseError, ForbiddenError } from '../utils/errors';

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface UploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  path: string;
  fieldname: string;
  encoding: string;
  destination?: string;
  filename?: string;
}

type CreateAttachmentData = {
  userId: string;
  type: AttachmentType;
  referenceId: string;
  file: UploadFile;
  metadata?: Record<string, any>;
};

export interface IAttachment extends Attachment {
  path: string;
  originalName: string;
  size: number;
  userId?: string;
  referenceId?: string;
}

class AttachmentService {
  /**
   * Create a new attachment
   */
  async createAttachment(attachmentData: CreateAttachmentData): Promise<Attachment> {
    const transaction = await sequelize.transaction();
    const { userId, type, referenceId, file, metadata } = attachmentData;
    
    try {
      // Validate file
      if (!file || !file.buffer || file.size === 0) {
        throw new ValidationError('Invalid file');
      }

      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        throw new ValidationError('File size exceeds the maximum allowed limit of 5MB');
      }

      // Create a unique filename
      const fileExt = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExt}`;
      const fullPath = path.join(UPLOAD_DIR, filename);

      // Write file to disk
      await fs.promises.writeFile(fullPath, file.buffer);

      // Create attachment record
      const attachment = await Attachment.create(
        {
          uploadedById: userId,
          orderId: type === 'order' ? referenceId : undefined,
          type,
          fileName: filename,
          filePath: filename,
          mimeType: file.mimetype,
          size: file.size,
          originalName: file.originalname,
          metadata: metadata || {}
        } as any, // Using type assertion as a temporary fix for type mismatch
        { transaction }
      );

      await transaction.commit();
      return attachment;
    } catch (error) {
      await transaction.rollback();
      
      // Clean up file if it was created
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      if (error instanceof ValidationError || 
          error instanceof NotFoundError || 
          error instanceof ForbiddenError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to create attachment', error as Error);
    }
  }

  /**
   * Get attachment by ID with access control
   */
  async getAttachmentById(attachmentId: string, userId?: string, userRole?: UserRole): Promise<Attachment> {
    const attachment = await Attachment.findByPk(attachmentId);
    
    if (!attachment) {
      throw new NotFoundError('Attachment not found');
    }

    // Check access based on attachment type
    await this.validateReferenceAccess(
      attachment.type, 
      attachment.referenceId || '', 
      userId, 
      undefined, 
      userRole
    );

    return attachment;
  }

  /**
   * Get file stream for downloading
   */
  async getFileStream(attachmentId: string, userId?: string, userRole?: UserRole) {
    const attachment = await this.getAttachmentById(attachmentId, userId, userRole);
    
    const filePath = path.join(UPLOAD_DIR, attachment.filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('File not found');
    }

    return {
      stream: fs.createReadStream(filePath),
      filename: attachment.originalName || attachment.fileName,
      mimeType: attachment.mimeType,
      size: attachment.size
    };
  }

  /**
   * List attachments with filters
   */
  async listAttachments({
    type,
    referenceId,
    userId,
    userRole,
    page = 1,
    limit = 10
  }: {
    type?: AttachmentType;
    referenceId?: string;
    userId?: string;
    userRole?: UserRole;
    page?: number;
    limit?: number;
  }): Promise<{ attachments: Attachment[]; total: number }> {
    const where: any = {};
    
    if (type) where.type = type;
    if (referenceId) where.referenceId = referenceId;
    
    // Regular users can only see their own attachments
    // Admins can see all attachments
    if (userRole !== 'admin') {
      where.userId = userId;
    }

    const { count, rows } = await Attachment.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'uploadedBy', attributes: ['id', 'name', 'email'] }
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
  async deleteAttachment(attachmentId: string, userId?: string, userRole?: UserRole): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const attachment = await Attachment.findByPk(attachmentId, { transaction });
      
      if (!attachment) {
        throw new NotFoundError('Attachment not found');
      }

      // Check permissions
      if (userRole !== 'admin' && attachment.userId !== userId) {
        throw new ForbiddenError('Not authorized to delete this attachment');
      }

      // Delete file from disk
      const filePath = path.join(UPLOAD_DIR, attachment.filePath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      // Delete attachment record
      await attachment.destroy({ transaction });
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof NotFoundError || 
          error instanceof ForbiddenError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to delete attachment', error as Error);
    }
  }

  /**
   * Delete all attachments for a reference
   */
  async deleteAttachmentsByReference(
    type: AttachmentType,
    referenceId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<number> {
    const transaction = await sequelize.transaction();
    
    try {
      const where: any = { type, referenceId };
      
      // Regular users can only delete their own attachments
      if (userRole !== 'admin') {
        where.userId = userId;
      }

      const attachments = await Attachment.findAll({ where, transaction });
      
      // Delete files from disk
      await Promise.all(
        attachments.map(attachment => {
          const filePath = path.join(UPLOAD_DIR, attachment.filePath);
          if (fs.existsSync(filePath)) {
            return fs.promises.unlink(filePath);
          }
          return Promise.resolve();
        })
      );

      // Delete attachment records
      const count = await Attachment.destroy({ where, transaction });
      
      await transaction.commit();
      return count;
    } catch (error) {
      await transaction.rollback();
      throw new DatabaseError('Failed to delete attachments', error as Error);
    }
  }

  /**
   * Validate that the user has access to the reference
   */
  private async validateReferenceAccess(
    type: AttachmentType,
    referenceId: string,
    userId?: string,
    transaction?: Transaction,
    userRole?: UserRole
  ): Promise<void> {
    if (!userId && userRole !== 'admin') {
      throw new ForbiddenError('Authentication required');
    }

    switch (type) {
      case 'complaint':
      case 'signature':
      case 'delivery_proof':
      case 'return_proof': {
        const complaint = await Complaint.findByPk(referenceId, { transaction });
        if (!complaint) {
          throw new NotFoundError('Reference not found');
        }
        
        // Only the complaint owner or salesman can add attachments
        if (complaint.userId !== userId && userRole !== 'salesman') {
          throw new ForbiddenError('Not authorized to add attachments to this complaint');
        }
        
        // Only allow adding attachments to open or in-progress complaints
        if (userRole !== 'salesman' && 
            complaint.status !== 'open' && 
            complaint.status !== 'in_progress') {
          throw new ValidationError('Cannot add attachments to a closed or resolved complaint');
        }
        break;
      }
      
      case 'order': {
        const order = await Order.findByPk(referenceId, { transaction });
        if (!order) {
          throw new NotFoundError('Order not found');
        }
        
        // Only the order owner or admin can add attachments
        if (order.userId !== userId && userRole !== 'admin') {
          throw new ForbiddenError('Not authorized to add attachments to this order');
        }
        break;
      }
      
      case 'profile': {
        // Only the user themselves or admin can add profile attachments
        if (referenceId !== userId && userRole !== 'admin') {
          throw new ForbiddenError('Not authorized to add attachments to this profile');
        }
        break;
      }
      
      default:
        throw new ValidationError('Invalid attachment type');
    }
  }

  /**
   * Clean up orphaned files (attachments that exist in the filesystem but not in the database)
   */
  async cleanupOrphanedFiles(): Promise<{ deleted: string[]; errors: string[] }> {
    const deleted: string[] = [];
    const errors: string[] = [];
    
    try {
      // Get all attachment paths from the database
      const attachments = await Attachment.findAll({
        attributes: ['filePath']
      });
      
      const dbPaths = new Set(attachments.map(a => a.filePath).filter((p): p is string => !!p));
      
      // Get all files in the upload directory
      const files = await fs.promises.readdir(UPLOAD_DIR);
      
      // Find and delete orphaned files
      await Promise.all(
        files.map(async (file) => {
          if (!dbPaths.has(file)) {
            try {
              const filePath = path.join(UPLOAD_DIR, file);
              await fs.promises.unlink(filePath);
              deleted.push(file);
            } catch (error) {
              errors.push(`Failed to delete ${file}: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        })
      );
      
      return { deleted, errors };
    } catch (error) {
      errors.push(`Failed to clean up orphaned files: ${error instanceof Error ? error.message : String(error)}`);
      return { deleted, errors };
    }
  }
}

export const attachmentService = new AttachmentService();