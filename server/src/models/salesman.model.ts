import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Beat } from './beat.model';
import { Visit } from './visit.model';

@Table({
  tableName: 'salesmen',
  timestamps: true,
  underscored: true
})
export class Salesman extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @HasMany(() => Beat)
  beats?: Beat[];

  @HasMany(() => Visit)
  visits?: Visit[];

  @Column(DataType.DATE)
  declare lastActiveAt: Date;

  @Column(DataType.DATE)
  declare created_at: Date;

  @Column(DataType.DATE)
  declare updatedAt: Date;
}
