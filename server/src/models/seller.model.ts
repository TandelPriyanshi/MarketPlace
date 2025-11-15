import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Product } from './product.model';
import { Order } from './order.model';

export enum SellerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

@Table({
  tableName: 'sellers',
  timestamps: true,
  underscored: true,
  paranoid: true,
  modelName: 'Seller'
})
export class Seller extends BaseModel<Seller> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare businessName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare businessDescription?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare businessAddress?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare businessPhone?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare businessEmail?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare taxId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(SellerStatus) as [string, ...string[]]),
    defaultValue: SellerStatus.PENDING,
    allowNull: false,
  })
  declare status: SellerStatus;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  })
  declare rating?: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  declare totalSales?: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: {},
  })
  declare metadata?: Record<string, unknown>;

  // Associations
  @BelongsTo(() => User, 'userId')
  declare user: User;

  @HasMany(() => Product, 'sellerId')
  declare products: Product[];

  @HasMany(() => Order)
  orders?: Order[];

  public static associate(models: Record<string, any>): void {
    Seller.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Seller.hasMany(models.Product, {
      foreignKey: 'sellerId',
      as: 'products',
    });

    Seller.hasMany(models.Order, {
      foreignKey: 'sellerId',
      as: 'orders',
    });
  }
}
