import { Model, Op } from 'sequelize';
import { User, UserRole } from '../models/user.model';

type UserAttributes = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  created_at: Date;
  updatedAt: Date;
};

class UserRepository {
  private static instance: UserRepository;
  
  private constructor() {}
  
  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async create(userData: Omit<UserAttributes, 'id' | 'created_at' | 'updatedAt' | 'lastLogin'>): Promise<User> {
    return await User.create(userData);
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findAll(limit: number = 10, offset: number = 0, filter?: Partial<UserAttributes>): Promise<{ rows: User[]; count: number }> {
    const where = filter ? { ...filter } : {};
    return await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  async update(id: string, userData: Partial<Omit<UserAttributes, 'id' | 'created_at' | 'updatedAt'>>): Promise<[number, User[]]> {
    return await User.update(userData, {
      where: { id },
      returning: true
    });
  }

  async delete(id: string): Promise<number> {
    return await User.destroy({
      where: { id }
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
  }

  async countByRole(role: UserRole): Promise<number> {
    return await User.count({
      where: { role }
    });
  }
}

export default UserRepository.getInstance();
