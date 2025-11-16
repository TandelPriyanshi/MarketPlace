import { Table, Column, Model, DataType, Default, IsEmail, Unique, HasMany } from 'sequelize-typescript';
import { Product } from './product.model';

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
  DELIVERY_PERSON = 'delivery_person',
  SALESMAN = 'salesman'
}

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'password_hash'
  })
  declare passwordHash: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.CUSTOMER,
  })
  declare role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_active'
  })
  declare isActive: boolean;

  // Associations
  @HasMany(() => Product, 'sellerId')
  declare products?: Product[];

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
