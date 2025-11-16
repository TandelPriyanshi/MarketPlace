import { Model, Op } from 'sequelize';
import { Seller } from '../models/seller.model';
import { User } from '../models/user.model';

type SellerAttributes = {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  taxId: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  created_at: Date;
  updatedAt: Date;
};

class SellerRepository {
  private static instance: SellerRepository;
  
  private constructor() {}
  
  public static getInstance(): SellerRepository {
    if (!SellerRepository.instance) {
      SellerRepository.instance = new SellerRepository();
    }
    return SellerRepository.instance;
  }

  async create(sellerData: Omit<SellerAttributes, 'id' | 'created_at' | 'updatedAt' | 'rating' | 'totalSales'>): Promise<Seller> {
    const seller = new Seller();
    Object.assign(seller, {
      ...sellerData,
      rating: 0,
      totalSales: 0
    });
    return await seller.save();
  }

  async findById(id: string, includeUser: boolean = false): Promise<Seller | null> {
    const options: any = { where: { id } };
    if (includeUser) {
      options.include = [User];
    }
    return await Seller.findByPk(id, options);
  }

  async findByUserId(userId: string): Promise<Seller | null> {
    return await Seller.findOne({ where: { userId } });
  }

  async findAll(limit: number = 10, offset: number = 0, filter?: Partial<SellerAttributes>): Promise<{ rows: Seller[]; count: number }> {
    const where = filter ? { ...filter } : {};
    return await Seller.findAndCountAll({
      where,
      limit,
      offset,
      include: [User],
      order: [['created_at', 'DESC']]
    });
  }

  async update(id: string, sellerData: Partial<Omit<SellerAttributes, 'id' | 'userId' | 'created_at' | 'updatedAt'>>): Promise<[number, Seller[]]> {
    return await Seller.update(sellerData, {
      where: { id },
      returning: true
    });
  }

  async delete(id: string): Promise<number> {
    return await Seller.destroy({
      where: { id }
    });
  }

  async updateRating(sellerId: string, newRating: number): Promise<void> {
    await Seller.update(
      { rating: newRating },
      { where: { id: sellerId } }
    );
  }

  async incrementSales(sellerId: string, amount: number = 1): Promise<void> {
    await Seller.increment('totalSales', {
      by: amount,
      where: { id: sellerId }
    });
  }
}

export default SellerRepository.getInstance();
