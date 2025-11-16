import { Op } from 'sequelize';
import { User, UserRole } from '../models/user.model';
import { Order } from '../models/order.model';

type CustomerAttributes = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isActive: boolean;
  lastOrderAt: Date | null;
  totalOrders: number;
  totalSpent: number;
  created_at: Date;
  updatedAt: Date;
};

class CustomerRepository {
  private static instance: CustomerRepository;
  
  private constructor() {}
  
  public static getInstance(): CustomerRepository {
    if (!CustomerRepository.instance) {
      CustomerRepository.instance = new CustomerRepository();
    }
    return CustomerRepository.instance;
  }

  async findById(id: string, includeOrders: boolean = false): Promise<User | null> {
    const options: any = { 
      where: { 
        id,
        role: UserRole.CUSTOMER 
      } 
    };
    
    if (includeOrders) {
      options.include = [
        { 
          model: Order, 
          as: 'orders',
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ];
    }
    
    return await User.findOne(options);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ 
      where: { 
        email,
        role: UserRole.CUSTOMER 
      } 
    });
  }

  async findAll(
    limit: number = 10, 
    offset: number = 0, 
    filter?: Partial<CustomerAttributes>,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ rows: User[]; count: number }> {
    const where: any = { 
      role: UserRole.CUSTOMER,
      ...filter 
    };
    
    return await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]]
    });
  }

  async update(
    id: string, 
    customerData: Partial<Omit<CustomerAttributes, 'id' | 'role' | 'created_at' | 'updatedAt' | 'totalOrders' | 'totalSpent'>>
  ): Promise<[number, User[]]> {
    return await User.update(customerData, {
      where: { 
        id,
        role: UserRole.CUSTOMER 
      },
      returning: true
    });
  }

  async delete(id: string): Promise<number> {
    return await User.destroy({
      where: { 
        id,
        role: UserRole.CUSTOMER 
      }
    });
  }

  async getCustomerStats(customerId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date | null;
    averageOrderValue: number;
  }> {
    const [orders, count] = await Promise.all([
      Order.findAll({
        where: { 
          userId: customerId,
          status: 'completed' 
        },
        attributes: ['totalAmount', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 1
      }),
      Order.count({ 
        where: { 
          userId: customerId,
          status: 'completed' 
        } 
      })
    ]);

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = count > 0 ? totalSpent / count : 0;
    const lastOrderDate = orders[0]?.createdAt || null;

    return {
      totalOrders: count,
      totalSpent,
      lastOrderDate,
      averageOrderValue
    };
  }

  async searchCustomers(query: string, limit: number = 10): Promise<User[]> {
    return await User.findAll({
      where: {
        [Op.and]: [
          { role: UserRole.CUSTOMER },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
              { phone: { [Op.like]: `%${query}%` } }
            ]
          }
        ]
      },
      limit,
      order: [['name', 'ASC']]
    });
  }

  async getTopCustomers(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }>> {
    // Using a raw query to avoid complex ORM limitations
    const [results] = await User.sequelize?.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email,
        COUNT(o.id) as "totalOrders",
        COALESCE(SUM(o."totalAmount"), 0) as "totalSpent"
      FROM 
        "users" u
      LEFT JOIN 
        "orders" o ON u.id = o."userId"
      WHERE 
        u.role = '${UserRole.CUSTOMER}'
      GROUP BY 
        u.id, u.name, u.email
      ORDER BY 
        "totalSpent" DESC
      LIMIT ${limit}
    `) || [[], 0];

    return (results as any[]).map(result => ({
      id: result.id,
      name: result.name || 'Unknown',
      email: result.email,
      totalOrders: parseInt(result.totalOrders) || 0,
      totalSpent: parseFloat(result.totalSpent) || 0
    }));
  }
}

export default CustomerRepository.getInstance();
