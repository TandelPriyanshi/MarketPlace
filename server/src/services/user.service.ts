import { Op } from 'sequelize';
import { User, UserRole } from '../models/user.model';
import userRepository from '../repositories/user.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

class UserService {
  async getUserById(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<{ users: User[]; pagination: { total: number; page: number; totalPages: number; limit: number } }> {
    const { page = 1, limit = 10, role, search } = options;
    const filter: any = {};

    if (role) filter.role = role;
    if (search) {
      filter[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const result = await userRepository.findAll(limit, (page - 1) * limit, filter);

    return {
      users: result.rows,
      pagination: {
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit),
        limit,
      },
    };
  }

  async updateUser(userId: string, updateData: {
    name?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.update(userId, updateData);
    return (await userRepository.findById(userId))!;
  }

  async deactivateUser(userId: string): Promise<User> {
    return await this.updateUser(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<User> {
    return await this.updateUser(userId, { isActive: true });
  }
}

export default new UserService();

