import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Order } from './order.model';

export enum DeliveryPersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended'
}

@Table({
  tableName: 'delivery_persons',
  timestamps: true,
  underscored: true,
  paranoid: true,
  modelName: 'DeliveryPerson'
})
export class DeliveryPerson extends BaseModel<DeliveryPerson> {
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
  declare vehicleType: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare vehicleNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare licenseNumber?: string;

  @Column({
    type: DataType.ENUM(...Object.values(DeliveryPersonStatus) as [string, ...string[]]),
    defaultValue: DeliveryPersonStatus.ACTIVE,
    allowNull: false,
  })
  declare status: DeliveryPersonStatus;

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
  declare totalDeliveries?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  declare totalEarnings?: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: {},
  })
  declare metadata?: Record<string, unknown>;

  // Associations
  @BelongsTo(() => User)
  user?: User;

  @HasMany(() => Order)
  orders?: Order[];

  public static associate(models: Record<string, any>): void {
    DeliveryPerson.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    DeliveryPerson.hasMany(models.Order, {
      foreignKey: 'deliveryPersonId',
      as: 'orders',
    });
  }
}