import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Beat } from './beat.model';
import { Visit } from './visit.model';

export enum StoreType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  DISTRIBUTOR = 'distributor'
}

@Table({
  tableName: 'stores',
  timestamps: true,
  underscored: true
})
export class Store extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column(DataType.TEXT)
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare contactPerson: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column(DataType.STRING)
  declare email: string;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
  })
  declare latitude: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
  })
  declare longitude: number;

  @Column({
    type: DataType.ENUM(...Object.values(StoreType) as [string, ...string[]]),
    defaultValue: StoreType.RETAIL,
    allowNull: false,
  })
  declare type: StoreType;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @ForeignKey(() => Beat)
  @Column(DataType.UUID)
  declare beatId: string;

  @BelongsTo(() => Beat)
  declare beat: Beat;

  @HasMany(() => Visit)
  declare visits: Visit[];

  @Column(DataType.DATE)
  declare lastVisitedAt: Date;

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;
}
