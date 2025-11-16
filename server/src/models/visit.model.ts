import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Salesman } from './salesman.model';
import { Store } from './store.model';

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Table({
  tableName: 'visits',
  timestamps: false,
  underscored: true
})
export class Visit extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Salesman)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare salesmanId: string;

  @Column({
    type: DataType.ENUM(...Object.values(VisitStatus) as [string, ...string[]]),
    defaultValue: VisitStatus.SCHEDULED,
    allowNull: false,
  })
  declare status: VisitStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare scheduledAt: Date;

  @Column(DataType.DATE)
  declare startedAt: Date;

  @Column(DataType.DATE)
  declare completedAt: Date;

  @Column(DataType.TEXT)
  declare purpose: string;

  @Column(DataType.TEXT)
  declare remarks: string;

  @Column(DataType.JSON)
  declare location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Column(DataType.JSON)
  declare checkIn: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    imageUrl?: string;
  };

  @Column(DataType.JSON)
  declare checkOut: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    summary?: string;
  };

  @BelongsTo(() => Salesman)
  declare salesman: Salesman;
}
