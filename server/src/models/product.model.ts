import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Seller } from './seller.model';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  OUT_OF_STOCK = 'out_of_stock'
}

@Table({
  tableName: 'products',
  timestamps: true
})
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Seller)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'seller_id'
  })
  declare sellerId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    comment: 'Stock Keeping Unit - unique identifier for the product'
  })
  declare sku?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  })
  declare stock: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: []
  })
  declare images?: string[];

  @Column({
    type: DataType.ENUM(...Object.values(ProductStatus) as [string, ...string[]]),
    defaultValue: ProductStatus.DRAFT,
    allowNull: false,
  })
  declare status: ProductStatus;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare metadata?: Record<string, any>;

  @BelongsTo(() => Seller, 'sellerId')
  declare seller?: Seller;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt?: Date;
}
