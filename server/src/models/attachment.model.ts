// src/models/attachment.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { User } from './user.model';

@Table({
  tableName: 'attachments',
  timestamps: true,
  underscored: true
})
export class Attachment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  orderId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  uploadedById!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fileName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  filePath!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mimeType!: string;

  @Column({
    type: DataType.ENUM('signature', 'delivery_proof', 'return_proof'),
    allowNull: false,
  })
  type!: 'signature' | 'delivery_proof' | 'return_proof';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => User, 'uploadedById')
  uploadedBy!: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt!: Date;
}