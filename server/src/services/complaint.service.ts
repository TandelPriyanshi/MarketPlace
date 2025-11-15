import { Op, Transaction } from 'sequelize';
import { Complaint, ComplaintStatus, ComplaintType } from '../models/complaint.model';
import { User, UserRole } from '../models/user.model';
import { Order } from '../models/order.model';
import { sequelize } from '../db';
import { NotFoundError, ValidationError, DatabaseError, ForbiddenError } from '../utils/errors';

type CreateComplaintData = {
  userId: string;
  orderId?: string;
  type: ComplaintType;
  title: string;
  description: string;
  attachments?: string[];
};

type UpdateComplaintData = {
  status?: ComplaintStatus;
  resolutionNotes?: string;
  resolvedById?: string;
  attachments?: string[];
};

class ComplaintService {
  /**
   * Create a new complaint
   */
  async createComplaint(complaintData: CreateComplaintData): Promise<Complaint> {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate required fields
      if (!complaintData.userId || !complaintData.type || !complaintData.title || !complaintData.description) {
        throw new ValidationError('Missing required fields');
      }

      // If orderId is provided, validate the order exists and belongs to the user
      if (complaintData.orderId) {
        const order = await Order.findOne({
          where: { id: complaintData.orderId, userId: complaintData.userId },
          transaction
        });

        if (!order) {
          throw new ValidationError('Order not found or access denied');
        }
      }

      // Create the complaint
      const complaint = await Complaint.create(
        {
          ...complaintData,
          status: ComplaintStatus.OPEN,
          attachments: complaintData.attachments || [],
        },
        { transaction }
      );

      await transaction.commit();
      return complaint.reload({
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Order, as: 'order', attributes: ['id', 'orderNumber'] }
        ]
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError('Failed to create complaint', error);
      }
      throw new DatabaseError('Failed to create complaint', new Error(String(error)));
    }
  }

  /**
   * Get complaint by ID with access control
   */
  async getComplaintById(complaintId: string, userId?: string, userRole?: UserRole): Promise<Complaint> {
    const where: any = { id: complaintId };
    
    // Regular users can only see their own complaints
    // Admins/salesman can see all complaints
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SALESMAN) {
      where.userId = userId;
    }

    const complaint = await Complaint.findOne({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber'] }
      ]
    });

    if (!complaint) {
      throw new NotFoundError('Complaint not found or access denied');
    }

    return complaint;
  }

  /**
   * List complaints with filters and pagination
   */
  async listComplaints({
    page = 1,
    limit = 10,
    status,
    type,
    userId,
    orderId,
    userRole,
    currentUserId
  }: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    type?: ComplaintType;
    userId?: string;
    orderId?: string;
    userRole?: UserRole;
    currentUserId?: string;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const where: any = {};
    
    // Apply filters
    if (status) where.status = status;
    if (type) where.type = type;
    if (orderId) where.orderId = orderId;
    
    // Regular users can only see their own complaints
    // Admins/salesman can see all complaints or filter by user
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SALESMAN) {
      where.userId = currentUserId;
    } else if (userId) {
      where.userId = userId;
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber'] }
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
  async updateComplaint(
    complaintId: string, 
    updateData: UpdateComplaintData,
    userId?: string,
    userRole?: UserRole
  ): Promise<Complaint> {
    const transaction = await sequelize.transaction();
    
    try {
      // Find the complaint
      const complaint = await Complaint.findByPk(complaintId, { transaction });
      
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }

      // Check permissions
      if (userRole !== UserRole.ADMIN && 
          userRole !== UserRole.SALESMAN && 
          complaint.userId !== userId) {
        throw new ForbiddenError('Not authorized to update this complaint');
      }

      // Prepare update data
      const updatePayload: any = {};
      
      // Only admins/salesman can change status and resolution notes
      if (userRole === UserRole.ADMIN || userRole === UserRole.SALESMAN) {
        if (updateData.status) {
          // Validate status transition
          const validTransitions = this.getValidStatusTransitions(complaint.status);
          if (!validTransitions.includes(updateData.status)) {
            throw new ValidationError(
              `Invalid status transition from ${complaint.status} to ${updateData.status}`
            );
          }
          
          updatePayload.status = updateData.status;
          
          // Set resolved info if status is being changed to RESOLVED or CLOSED
          if ((updateData.status === ComplaintStatus.RESOLVED || 
               updateData.status === ComplaintStatus.CLOSED) && 
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
        if (complaint.userId === userId && complaint.status === ComplaintStatus.OPEN) {
          updatePayload.attachments = [
            ...(complaint.attachments || []),
            ...updateData.attachments
          ];
        } else if (userRole !== UserRole.ADMIN && userRole !== UserRole.SALESMAN) {
          throw new ForbiddenError('Cannot add attachments to this complaint');
        }
      }

      // Update the complaint
      await complaint.update(updatePayload, { transaction });
      
      await transaction.commit();
      return complaint.reload({
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'resolvedBy', attributes: ['id', 'name', 'email'] },
          { model: Order, as: 'order', attributes: ['id', 'orderNumber'] }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || 
          error instanceof NotFoundError || 
          error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DatabaseError('Failed to update complaint', error);
      }
      throw new DatabaseError('Failed to update complaint', new Error(String(error)));
    }
  }

  /**
   * Get valid status transitions based on current status
   */
  private getValidStatusTransitions(currentStatus: ComplaintStatus): ComplaintStatus[] {
    const statusTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
      [ComplaintStatus.OPEN]: [
        ComplaintStatus.IN_PROGRESS, 
        ComplaintStatus.RESOLVED, 
        ComplaintStatus.CLOSED,
        ComplaintStatus.REJECTED
      ],
      [ComplaintStatus.IN_PROGRESS]: [
        ComplaintStatus.RESOLVED, 
        ComplaintStatus.CLOSED,
        ComplaintStatus.REJECTED
      ],
      [ComplaintStatus.RESOLVED]: [
        ComplaintStatus.CLOSED,
        ComplaintStatus.REOPENED
      ],
      [ComplaintStatus.REOPENED]: [
        ComplaintStatus.IN_PROGRESS,
        ComplaintStatus.RESOLVED,
        ComplaintStatus.CLOSED,
        ComplaintStatus.REJECTED
      ],
      [ComplaintStatus.REJECTED]: [
        ComplaintStatus.REOPENED
      ],
      [ComplaintStatus.CLOSED]: []
    };

    return statusTransitions[currentStatus] || [];
  }

  /**
   * Get complaint statistics
   */
  async getComplaintStats(userId?: string, userRole?: UserRole): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    rejected: number;
    byType: Record<ComplaintType, number>;
    recent: Complaint[];
  }> {
    const where: any = {};
    
    // Regular users can only see their own stats
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SALESMAN) {
      where.userId = userId;
    }

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      rejected,
      byTypeResult,
      recent
    ] = await Promise.all([
      Complaint.count({ where }),
      Complaint.count({ where: { ...where, status: ComplaintStatus.OPEN } }),
      Complaint.count({ where: { ...where, status: ComplaintStatus.IN_PROGRESS } }),
      Complaint.count({ where: { ...where, status: ComplaintStatus.RESOLVED } }),
      Complaint.count({ where: { ...where, status: ComplaintStatus.CLOSED } }),
      Complaint.count({ where: { ...where, status: ComplaintStatus.REJECTED } }),
      (async () => {
        const types = Object.values(ComplaintType);
        const counts = await Promise.all(
          types.map(type => 
            Complaint.count({ 
              where: { ...where, type } 
            })
            .then(count => ({ type, count }))
          )
        );
        return counts.reduce((acc, { type, count }) => ({
          ...acc,
          [type]: count
        }), {} as Record<ComplaintType, number>);
      })(),
      Complaint.findAll({
        where,
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
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
  async createComplaintWithFiles(
    userId: string,
    complaintData: {
      orderId?: string;
      type: ComplaintType;
      title: string;
      description: string;
      attachments?: string[];
    },
    files?: Express.Multer.File[]
  ): Promise<Complaint> {
    const transaction = await sequelize.transaction();
    
    try {
      // Handle file uploads
      const attachments: string[] = complaintData.attachments || [];
      
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
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get user complaints with pagination
   */
  async getUserComplaints(userId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ complaints: Complaint[]; pagination: { total: number; page: number; totalPages: number; limit: number } }> {
    const { page = 1, limit = 10, status } = options;
    const result = await this.listComplaints({
      page,
      limit,
      status: status as ComplaintStatus,
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
  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    resolutionNotes?: string
  ): Promise<Complaint> {
    return await this.updateComplaint(
      complaintId,
      { status, resolutionNotes },
      undefined,
      UserRole.ADMIN // Assuming admin is updating
    );
  }

  /**
   * Add attachment to complaint
   */
  async addAttachment(
    complaintId: string, 
    userId: string, 
    userRole: UserRole, 
    filePath: string
  ): Promise<Complaint> {
    const transaction = await sequelize.transaction();
    
    try {
      const complaint = await Complaint.findByPk(complaintId, { transaction });
      
      if (!complaint) {
        throw new NotFoundError('Complaint not found');
      }

      // Check permissions
      if (userRole !== UserRole.ADMIN && 
          userRole !== UserRole.SALESMAN && 
          complaint.userId !== userId) {
        throw new ForbiddenError('Not authorized to add attachments to this complaint');
      }

      // Only allow adding attachments to open or in-progress complaints
      if (userRole !== UserRole.ADMIN && 
          userRole !== UserRole.SALESMAN && 
          complaint.status !== ComplaintStatus.OPEN && 
          complaint.status !== ComplaintStatus.IN_PROGRESS) {
        throw new ValidationError('Cannot add attachments to a closed or resolved complaint');
      }

      // Add the new attachment
      const attachments = [...(complaint.attachments || []), filePath];
      
      await complaint.update({ attachments }, { transaction });
      
      await transaction.commit();
      return complaint.reload();
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundError || 
          error instanceof ForbiddenError || 
          error instanceof ValidationError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DatabaseError('Failed to add attachment', error);
      }
      throw new DatabaseError('Failed to add attachment', new Error(String(error)));
    }
  }
}

export const complaintService = new ComplaintService();
