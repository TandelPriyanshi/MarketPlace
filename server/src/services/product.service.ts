import { Op, Transaction } from 'sequelize';
import { Product, ProductStatus } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/orderItem.model';
import { sequelize } from '../db';
import { NotFoundError, ValidationError, DatabaseError } from '../utils/errors';

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.sellerId) {
        throw new ValidationError('Name, price, and sellerId are required');
      }

      // Check if product with same SKU already exists
      if (productData.sku) {
        const existingProduct = await Product.findOne({
          where: { sku: productData.sku },
          transaction
        });
        
        if (existingProduct) {
          throw new ValidationError('Product with this SKU already exists');
        }
      }

      // Create the product
      const product = await Product.create(
        {
          ...productData,
          status: ProductStatus.DRAFT,
          rating: 0,
          reviewCount: 0,
        },
        { transaction }
      );

      await transaction.commit();
      return product;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) throw error;
      if (error instanceof Error) {
        throw new DatabaseError('Failed to create product', error);
      }
      throw new DatabaseError('Failed to create product', new Error(String(error)));
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, updateData: Partial<Omit<Product, 'rating' | 'reviewCount'>> & { rating?: number; reviewCount?: number }): Promise<Product> {
    const transaction = await sequelize.transaction();
    
    try {
      // Find the product
      const product = await Product.findOne({
        where: { id: productId },
        transaction
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      // Disallow updating certain fields directly
      const { id, sellerId: _, ...safeUpdateData } = updateData;
      
      if (Object.keys(safeUpdateData).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      // Update the product
      await product.update(safeUpdateData, { transaction });
      
      await transaction.commit();
      return product.reload();
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundError) throw error;
      if (error instanceof ValidationError) throw error;
      if (error instanceof Error) {
        throw new DatabaseError('Failed to update product', error);
      }
      throw new DatabaseError('Failed to update product', new Error(String(error)));
    }
  }

  /**
   * Get product by ID with optional seller verification
   */
  async getProductById(productId: string, sellerId?: string): Promise<Product> {
    const where: any = { id: productId };
    if (sellerId) where.sellerId = sellerId;
    
    const product = await Product.findOne({
      where,
      include: [
        { model: Category, as: 'categories' },
        { 
          model: Review, 
          as: 'reviews',
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * List products with pagination and filters
   */
  async listProducts({
    page = 1,
    limit = 10,
    categoryId,
    sellerId,
    minPrice,
    maxPrice,
    searchQuery,
    status = ProductStatus.PUBLISHED
  }: {
    page?: number;
    limit?: number;
    categoryId?: string;
    sellerId?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    status?: ProductStatus;
  }): Promise<{ products: Product[]; total: number }> {
    const where: any = {};
    
    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }
    
    if (searchQuery) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
        { sku: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }
    
    if (categoryId) {
      where['$categories.id$'] = categoryId;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: categoryId ? [
        { 
          model: Category, 
          as: 'categories',
          where: { id: categoryId },
          required: true
        }
      ] : [],
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    return {
      products: rows,
      total: count
    };
  }

  /**
   * Update product stock (increment/decrement)
   */
  async updateStock(
    productId: string,
    quantity: number,
    operation: 'increment' | 'decrement' | 'set' = 'set'
  ): Promise<Product> {
    const product = await Product.findByPk(productId);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const transaction = await sequelize.transaction();
    
    try {
      let newStock = product.stock;
      
      if (operation === 'increment') {
        newStock += quantity;
      } else if (operation === 'decrement') {
        if (product.stock < quantity) {
          throw new ValidationError('Insufficient stock');
        }
        newStock -= quantity;
      } else {
        newStock = quantity;
      }
      
      if (newStock < 0) {
        throw new ValidationError('Stock cannot be negative');
      }
      
      await product.update({ stock: newStock }, { transaction });
      
      // If stock reaches zero, update status to OUT_OF_STOCK if not already
      if (newStock === 0 && product.status !== ProductStatus.OUT_OF_STOCK) {
        await product.update({ status: ProductStatus.OUT_OF_STOCK }, { transaction });
      }
      // If stock is back in stock, update status to PUBLISHED
      else if (newStock > 0 && product.status === ProductStatus.OUT_OF_STOCK) {
        await product.update({ status: ProductStatus.PUBLISHED }, { transaction });
      }
      
      await transaction.commit();
      return product.reload();
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      if (error instanceof Error) {
        throw new DatabaseError('Failed to update product stock', error);
      }
      throw new DatabaseError('Failed to update product stock', new Error(String(error)));
    }
  }

  /**
   * Update product status
   */
  async updateProductStatus(
    productId: string,
    sellerId: string,
    status: ProductStatus
  ): Promise<Product> {
    const product = await Product.findOne({ where: { id: productId, sellerId } });
    
    if (!product) {
      throw new NotFoundError('Product not found or access denied');
    }

    // Additional validation can be added here based on business rules
    // For example, prevent setting to PUBLISHED if required fields are missing
    
    return product.update({ status });
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<{
    totalProducts: number;
    publishedCount: number;
    outOfStockCount: number;
    lowStockCount: number;
    topSelling: Array<{
      productId: string;
      totalSold: number;
      product: {
        id: string;
        name: string;
        price: number;
      };
    }>;
  }> {
    const [
      totalProducts,
      publishedCount,
      outOfStockCount,
      lowStockCount
    ] = await Promise.all([
      Product.count(),
      Product.count({ where: { status: ProductStatus.PUBLISHED } }),
      Product.count({ where: { status: ProductStatus.OUT_OF_STOCK } }),
      Product.count({ 
        where: { 
          stock: { [Op.lt]: 10 }, // Consider products with less than 10 items as low stock
          status: ProductStatus.PUBLISHED 
        } 
      }),
    ]);

    // Get top selling products
    const topSellingRaw = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price'],
        required: true
      }],
      group: ['productId', 'product.id'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit: 5,
      raw: true,
      nest: true
    });
    
    // Transform the raw data to match the expected type
    const topSelling = topSellingRaw.map((item: any) => {
      // Type assertion for the raw query result
      const typedItem = item as unknown as {
        productId: string;
        totalSold: string | number;
        'product.id': string;
        'product.name': string;
        'product.price': string | number;
      };
      
      return {
        productId: typedItem.productId,
        totalSold: typeof typedItem.totalSold === 'string' 
          ? parseInt(typedItem.totalSold, 10) 
          : typedItem.totalSold,
        product: {
          id: typedItem['product.id'],
          name: typedItem['product.name'],
          price: typeof typedItem['product.price'] === 'string'
            ? parseFloat(typedItem['product.price'])
            : typedItem['product.price']
        }
      };
    });

    return {
      totalProducts,
      publishedCount: publishedCount,
      outOfStockCount: outOfStockCount,
      lowStockCount: lowStockCount,
      topSelling
    };
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(options: {
    page?: number;
    limit?: number;
    status?: string;
    sellerId?: string;
    search?: string;
  }): Promise<{ products: Product[]; pagination: { total: number; page: number; totalPages: number; limit: number } }> {
    const { page = 1, limit = 10, status, sellerId, search } = options;
    const where: any = {};

    // By default, exclude archived products unless explicitly requested
    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.ne]: ProductStatus.ARCHIVED };
    }
    
    if (sellerId) where.sellerId = sellerId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    };
  }

  /**
   * Delete a product (soft delete)
   */
  async deleteProduct(productId: string, sellerId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // Check if there are any active orders for this product
      const activeOrderItems = await OrderItem.count({
        where: { productId },
        include: [
          {
            model: Order,
            as: 'order',
            where: {
              status: {
                [Op.notIn]: ['cancelled', 'delivered', 'returned', 'refunded']
              }
            },
            required: true
          }
        ],
        transaction
      });

      if (activeOrderItems > 0) {
        throw new ValidationError('Cannot delete product with active orders');
      }

      // Soft delete the product
      const deleted = await Product.update(
        { status: ProductStatus.ARCHIVED },
        { 
          where: { id: productId, sellerId },
          transaction
        }
      );

      await transaction.commit();
      return deleted[0] > 0;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError) throw error;
      if (error instanceof Error) {
        throw new DatabaseError('Failed to delete product', error);
      }
      throw new DatabaseError('Failed to delete product', new Error(String(error)));
    }
  }
}

export default new ProductService();
