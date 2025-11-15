import { Op } from 'sequelize';
import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Visit } from '../models/visit.model';
import { Store } from '../models/store.model';

type SalesmanAttributes = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

class SalesmanRepository {
  private static instance: SalesmanRepository;
  
  private constructor() {}
  
  public static getInstance(): SalesmanRepository {
    if (!SalesmanRepository.instance) {
      SalesmanRepository.instance = new SalesmanRepository();
    }
    return SalesmanRepository.instance;
  }

  async create(salesmanData: Omit<SalesmanAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>): Promise<Salesman> {
    const salesman = new Salesman();
    Object.assign(salesman, {
      ...salesmanData,
      isActive: true,
      lastActiveAt: null
    });
    return await salesman.save();
  }

  async findById(id: string, includeRelations: boolean = false): Promise<Salesman | null> {
    const options: any = { where: { id } };
    if (includeRelations) {
      options.include = [
        { model: Beat, as: 'beats' },
        { 
          model: Visit, 
          as: 'visits',
          include: [Store],
          limit: 10,
          order: [['scheduledAt', 'DESC']]
        }
      ];
    }
    return await Salesman.findByPk(id, options);
  }

  async findByEmail(email: string): Promise<Salesman | null> {
    return await Salesman.findOne({ where: { email } });
  }

  async findAll(limit: number = 10, offset: number = 0, filter?: Partial<SalesmanAttributes>): Promise<{ rows: Salesman[]; count: number }> {
    const where = filter ? { ...filter } : {};
    return await Salesman.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async update(id: string, salesmanData: Partial<Omit<SalesmanAttributes, 'id' | 'createdAt' | 'updatedAt'>>): Promise<[number, Salesman[]]> {
    return await Salesman.update(salesmanData, {
      where: { id },
      returning: true
    });
  }

  async delete(id: string): Promise<number> {
    return await Salesman.destroy({
      where: { id }
    });
  }

  async updateLastActive(salesmanId: string): Promise<void> {
    await Salesman.update(
      { lastActiveAt: new Date() },
      { where: { id: salesmanId } }
    );
  }

  async getSalesmanStats(salesmanId: string): Promise<{
    totalBeats: number;
    activeBeats: number;
    totalVisits: number;
    visitsThisMonth: number;
    storesCovered: number;
  }> {
    const [totalBeats, activeBeats, totalVisits, visitsThisMonth, storesCovered] = await Promise.all([
      Beat.count({ where: { salesmanId } }),
      Beat.count({ 
        where: { 
          salesmanId,
          status: 'active'
        } 
      }),
      Visit.count({ where: { salesmanId } }),
      Visit.count({ 
        where: { 
          salesmanId,
          createdAt: {
            [Op.gte]: new Date(new Date().setDate(1)), // First day of current month
            [Op.lte]: new Date() // Now
          }
        } 
      }),
      Store.count({ 
        where: { 
          '$beats.salesmanId$': salesmanId 
        },
        include: [
          {
            model: Beat,
            as: 'beats',
            required: true
          }
        ],
        distinct: true
      })
    ]);

    return { totalBeats, activeBeats, totalVisits, visitsThisMonth, storesCovered };
  }

  async getActiveSalesmen(): Promise<Salesman[]> {
    return await Salesman.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  }
}

export default SalesmanRepository.getInstance();
