// src/models/attachment.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { User } from './user.model';

export type AttachmentType = 'signature' | 'delivery_proof' | 'return_proof' | 'complaint' | 'order' | 'profile';

export interface IAttachmentAttributes {
  id: string;
  orderId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  type: AttachmentType;
  referenceId?: string;
  userId?: string;
  originalName?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'attachments',
  timestamps: true,
  underscored: true
})
export class Attachment extends Model<IAttachmentAttributes> implements IAttachmentAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare orderId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare uploadedById: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fileName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare filePath: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mimeType: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare size: number;

  @Column({
    type: DataType.ENUM('signature', 'delivery_proof', 'return_proof', 'complaint', 'order', 'profile'),
    allowNull: false,
  })
  declare type: AttachmentType;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare referenceId?: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare userId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare originalName?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare metadata?: Record<string, any>;

  @BelongsTo(() => Order)
  declare order?: Order;

  @BelongsTo(() => User, 'uploadedById')
  declare uploadedBy: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;
}