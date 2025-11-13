import { Model } from 'sequelize-typescript';
import { User } from './user.model';
export declare enum ProductStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    OUT_OF_STOCK = "out_of_stock"
}
export declare class Product extends Model {
    id: string;
    sellerId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    images?: string[];
    status: ProductStatus;
    metadata?: Record<string, any>;
    seller?: User;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=product.model.d.ts.map