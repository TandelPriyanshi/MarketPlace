import { Op } from 'sequelize';
import { Product } from '../models/product.model';
import { Seller } from '../models/seller.model';

type ProductAttributes = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  imageUrl: string | null;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  created_at: Date;
  updatedAt: Date;
};

class ProductRepository {
  private static instance: ProductRepository;
  
  private constructor() {}
  
  public static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository();
    }
    return ProductRepository.instance;
  }

  async create(productData: Omit<ProductAttributes, 'id' | 'created_at' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Product> {
    const product = new Product();
    Object.assign(product, {
      ...productData,
      rating: 0,
      reviewCount: 0
    });
    return await product.save();
  }

  async findById(id: string, includeSeller: boolean = false): Promise<Product | null> {
    const options: any = { where: { id } };
    if (includeSeller) {
      options.include = [Seller];
    }
    return await Product.findByPk(id, options);
  }

  async findBySeller(sellerId: string, limit: number = 10, offset: number = 0): Promise<{ rows: Product[]; count: number }> {
    return await Product.findAndCountAll({
      where: { sellerId },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  async search(query: string, category?: string, minPrice?: number, maxPrice?: number, limit: number = 10, offset: number = 0): Promise<{ rows: Product[]; count: number }> {
    const where: any = {
      [Op.and]: [
        {
          [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        { isActive: true }
      ]
    };

    if (category) where.category = category;
    if (minPrice) where.price = { ...where.price, [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };

    return await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [Seller]
    });
  }

  async update(id: string, productData: Partial<Omit<ProductAttributes, 'id' | 'sellerId' | 'created_at' | 'updatedAt'>>): Promise<[number, Product[]]> {
    return await Product.update(productData, {
      where: { id },
      returning: true
    });
  }

  async updateStock(id: string, quantity: number): Promise<[number, Product[]]> {
    return await Product.update(
      { stock: quantity },
      { where: { id }, returning: true }
    );
  }

  async delete(id: string): Promise<number> {
    return await Product.destroy({
      where: { id }
    });
  }

  async updateRating(productId: string, newRating: number): Promise<void> {
    await Product.update(
      { rating: newRating },
      { where: { id: productId } }
    );
  }

  async incrementReviewCount(productId: string): Promise<void> {
    await Product.increment('reviewCount', {
      by: 1,
      where: { id: productId }
    });
  }
}

export default ProductRepository.getInstance();
