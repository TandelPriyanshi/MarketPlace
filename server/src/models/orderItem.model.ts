import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order, OrderStatus } from './order.model';
import { Product } from './product.model';
import { User } from './user.model';

@Table({
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
})
export class OrderItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare orderId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare sellerId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  })
  declare price: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus) as [string, ...string[]]),
    defaultValue: OrderStatus.PENDING,
    allowNull: false,
    validate: {
      isIn: [Object.values(OrderStatus)],
    },
  })
  declare status: OrderStatus;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isCancelled: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare cancellationReason?: string;

  @BelongsTo(() => Order)
  declare order?: Order;

  @BelongsTo(() => Product)
  declare product?: Product;

  @BelongsTo(() => User, 'sellerId')
  declare seller?: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;
}

