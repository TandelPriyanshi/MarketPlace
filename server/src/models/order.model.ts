import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { OrderItem } from './orderItem.model';
import { User } from './user.model';
import { Product } from './product.model';
import { Seller } from './seller.model';
import { DeliveryPerson } from './deliveryPerson.model';

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  RETURN_REJECTED = 'return_rejected',
  RETURN_COMPLETED = 'return_completed'
}

@Table({
  tableName: 'orders',
  timestamps: true
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare orderNumber: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  })
  declare totalAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryStatus) as [string, ...string[]]),
    defaultValue: DeliveryStatus.PENDING,
    allowNull: false,
    validate: {
      isIn: [Object.values(DeliveryStatus)]
    }
  })
  declare deliveryStatus: DeliveryStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus) as [string, ...string[]]),
    defaultValue: PaymentStatus.PENDING,
    allowNull: false,
    validate: {
      isIn: [Object.values(PaymentStatus)]
    }
  })
  declare paymentStatus: PaymentStatus;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus) as [string, ...string[]]),
    defaultValue: OrderStatus.PENDING,
    allowNull: false,
    validate: {
      isIn: [Object.values(OrderStatus)]
    }
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
  shippingAddress?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  billingAddress?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidMetadata(value: unknown) {
        if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
          throw new Error('Metadata must be an object');
        }
      }
    }
  })
  declare metadata: Record<string, unknown> | null;

  @ForeignKey(() => Seller)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare sellerId: string;

  @BelongsTo(() => User)
  user?: User;

  @BelongsTo(() => Seller)
  seller?: Seller;

  @ForeignKey(() => DeliveryPerson)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare deliveryPersonId?: string;

  @BelongsTo(() => DeliveryPerson)
  deliveryPerson?: DeliveryPerson;

  @HasMany(() => OrderItem)
  items?: OrderItem[];

  // Timestamps
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt?: Date;
}
