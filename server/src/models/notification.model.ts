import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { User } from './user.model';

export enum NotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  COMPLAINT_CREATED = 'complaint_created',
  COMPLAINT_RESOLVED = 'complaint_resolved',
  PRODUCT_LOW_STOCK = 'product_low_stock',
  DELIVERY_ASSIGNED = 'delivery_assigned',
  DELIVERY_COMPLETED = 'delivery_completed',
  SYSTEM_UPDATE = 'system_update'
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true
})
export class Notification extends Model<Notification> {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  })
  declare userId: string;

  @Column({
    type: DataTypes.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  declare type: NotificationType;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  declare message: string;

  @Column({
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  })
  declare data: Record<string, any>;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'isRead'
  })
  declare isRead: boolean;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  })
  declare readAt?: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  declare user: User;
}

// Setup associations
export function setupNotificationAssociations() {
  Notification.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
  });
}
