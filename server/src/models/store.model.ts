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
  timestamps: false,
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

  @Column(DataType.STRING)
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column(DataType.TEXT)
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'contact_person'
  })
  declare contactPerson: string;

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

  @ForeignKey(() => Beat)
  @Column({
    type: DataType.UUID,
    field: 'beat_id'
  })
  declare beatId: string;

  @BelongsTo(() => Beat)
  declare beat: Beat;

  @Column({
    type: DataType.DATE,
    field: 'last_visited_at'
  })
  declare lastVisitedAt: Date;
}
