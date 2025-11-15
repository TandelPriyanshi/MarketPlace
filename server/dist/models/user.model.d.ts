import { Model } from 'sequelize-typescript';
export declare enum UserRole {
    ADMIN = "admin",
    SELLER = "seller",
    CUSTOMER = "customer",
    DELIVERY_PERSON = "delivery_person"
}
export declare class User extends Model {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.model.d.ts.map