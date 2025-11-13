import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Order } from './order.model';

export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  CLOSED = 'closed'
}

export enum ComplaintType {
  ORDER_ISSUE = 'order_issue',
  DELIVERY_ISSUE = 'delivery_issue',
  PRODUCT_QUALITY = 'product_quality',
  SELLER_BEHAVIOR = 'seller_behavior',
  PAYMENT_ISSUE = 'payment_issue',
  OTHER = 'other'
}

@Table({
  tableName: 'complaints',
  timestamps: true,
  underscored: true
})
export class Complaint extends Model {
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

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: true, // Can be null if complaint is not related to an order
  })
  declare orderId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ComplaintType)),
    allowNull: false,
  })
  declare type: ComplaintType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.ENUM(...Object.values(ComplaintStatus)),
    defaultValue: ComplaintStatus.OPEN,
    allowNull: false,
  })
  declare status: ComplaintStatus;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  declare attachments: string[]; // Array of file paths or URLs

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare resolutionNotes?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true, // Admin/Seller who resolved the complaint
  })
  declare resolvedById?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare resolvedAt?: Date;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @BelongsTo(() => Order, 'orderId')
  order?: Order;

  @BelongsTo(() => User, 'resolvedById')
  resolvedBy?: User;

  // Timestamps
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

// Add associations
export function setupComplaintAssociations() {
  Complaint.belongsTo(User, { foreignKey: 'userId' });
  Complaint.belongsTo(Order, { foreignKey: 'orderId' });
  Complaint.belongsTo(User, { as: 'resolvedBy', foreignKey: 'resolvedById' });
}
