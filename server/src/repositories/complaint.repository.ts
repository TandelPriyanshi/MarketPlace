import { Op } from 'sequelize';
import { Complaint, ComplaintStatus, ComplaintType } from '../models/complaint.model';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';

type ComplaintAttributes = {
  id: string;
  userId: string;
  orderId: string | null;
  type: ComplaintType;
  title: string;
  description: string;
  status: ComplaintStatus;
  attachments: string[];
  resolutionNotes: string | null;
  resolvedById: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreateComplaintData = Omit<ComplaintAttributes, 
  'id' | 'status' | 'resolutionNotes' | 'resolvedById' | 'resolvedAt' | 'createdAt' | 'updatedAt'
> & {
  attachments?: string[];
};

class ComplaintRepository {
  private static instance: ComplaintRepository;
  
  private constructor() {}
  
  public static getInstance(): ComplaintRepository {
    if (!ComplaintRepository.instance) {
      ComplaintRepository.instance = new ComplaintRepository();
    }
    return ComplaintRepository.instance;
  }

  async create(complaintData: CreateComplaintData): Promise<Complaint> {
    const complaint = new Complaint();
    Object.assign(complaint, {
      ...complaintData,
      status: ComplaintStatus.OPEN,
      attachments: complaintData.attachments || [],
      resolutionNotes: null,
      resolvedById: null,
      resolvedAt: null
    });
    return await complaint.save();
  }

  async findById(id: string, includeRelations: boolean = true): Promise<Complaint | null> {
    const options: any = { where: { id } };
    
    if (includeRelations) {
      options.include = [
        { model: User, as: 'user' },
        { model: User, as: 'resolvedBy' },
        { model: Order, as: 'order' }
      ];
    }
    
    return await Complaint.findByPk(id, options);
  }

  async findByUser(userId: string, limit: number = 10, offset: number = 0): Promise<{ rows: Complaint[]; count: number }> {
    return await Complaint.findAndCountAll({
      where: { userId },
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'resolvedBy' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async findByOrder(orderId: string): Promise<Complaint[]> {
    return await Complaint.findAll({
      where: { orderId },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'resolvedBy' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findAll(
    limit: number = 10, 
    offset: number = 0, 
    filter?: {
      status?: ComplaintStatus;
      type?: ComplaintType;
      userId?: string;
      orderId?: string;
      resolvedById?: string | null;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ rows: Complaint[]; count: number }> {
    const where: any = {};
    
    if (filter) {
      if (filter.status) where.status = filter.status;
      if (filter.type) where.type = filter.type;
      if (filter.userId) where.userId = filter.userId;
      if (filter.orderId) where.orderId = filter.orderId;
      if (filter.resolvedById !== undefined) where.resolvedById = filter.resolvedById;
      
      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt[Op.gte] = filter.startDate;
        if (filter.endDate) where.createdAt[Op.lte] = filter.endDate;
      }
    }
    
    return await Complaint.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'resolvedBy' },
        { model: Order, as: 'order' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async updateStatus(
    id: string, 
    status: ComplaintStatus, 
    resolvedById?: string, 
    resolutionNotes?: string
  ): Promise<[number, Complaint[]]> {
    const updateData: any = { status };
    
    if (status === ComplaintStatus.RESOLVED || status === ComplaintStatus.CLOSED) {
      updateData.resolvedById = resolvedById || null;
      updateData.resolvedAt = new Date();
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }
    } else if (status === ComplaintStatus.REJECTED) {
      updateData.resolvedById = resolvedById || null;
      updateData.resolvedAt = new Date();
      updateData.resolutionNotes = resolutionNotes || 'Complaint rejected';
    }
    
    return await Complaint.update(updateData, {
      where: { id },
      returning: true
    });
  }

  async addAttachment(complaintId: string, filePath: string): Promise<[number, Complaint[]]> {
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    
    const attachments = [...(complaint.attachments || []), filePath];
    
    return await Complaint.update(
      { attachments },
      { 
        where: { id: complaintId },
        returning: true 
      }
    );
  }

  async getStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    closed: number;
    byType: Record<ComplaintType, number>;
  }> {
    const [total, open, inProgress, resolved, rejected, closed, byType] = await Promise.all([
      Complaint.count(),
      Complaint.count({ where: { status: ComplaintStatus.OPEN } }),
      Complaint.count({ where: { status: ComplaintStatus.IN_PROGRESS } }),
      Complaint.count({ where: { status: ComplaintStatus.RESOLVED } }),
      Complaint.count({ where: { status: ComplaintStatus.REJECTED } }),
      Complaint.count({ where: { status: ComplaintStatus.CLOSED } }),
      (async () => {
        const types = Object.values(ComplaintType);
        const counts = await Promise.all(
          types.map(type => 
            Complaint.count({ where: { type } })
              .then(count => ({ type, count }))
          )
        );
        return counts.reduce((acc, { type, count }) => ({
          ...acc,
          [type]: count
        }), {} as Record<ComplaintType, number>);
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

export default ComplaintRepository.getInstance();
