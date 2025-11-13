import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Salesman } from './salesman.model';
import { Store } from './store.model';

export enum BeatStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed'
}

@Table({
  tableName: 'beats',
  timestamps: true,
  underscored: true
})
export class Beat extends Model {
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
  declare description: string;

  @ForeignKey(() => Salesman)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare salesmanId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare endDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(BeatStatus) as [string, ...string[]]),
    defaultValue: BeatStatus.ACTIVE,
    allowNull: false,
  })
  declare status: BeatStatus;

  @Column(DataType.JSONB)
  declare route: {
    coordinates: Array<{ lat: number; lng: number }>;
    waypoints: Array<{ storeId: string; order: number }>;
  };

  @BelongsTo(() => Salesman)
  declare salesman: Salesman;

  @HasMany(() => Store)
  declare stores: Store[];

  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;
}
