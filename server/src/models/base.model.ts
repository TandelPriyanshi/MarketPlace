import { Model } from 'sequelize-typescript';

export abstract class BaseModel<T extends Model = Model> extends Model<T> {
  public static associate?(models: Record<string, typeof Model>): void {
    // Can be overridden by subclasses
  }

  // Common fields that all models will have
  declare id: string;
  declare readonly created_at: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt?: Date | null;
}
