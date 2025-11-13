import { Model } from 'sequelize-typescript';
import { Beat } from './beat.model';
import { Visit } from './visit.model';
export declare enum StoreType {
    RETAIL = "retail",
    WHOLESALE = "wholesale",
    DISTRIBUTOR = "distributor"
}
export declare class Store extends Model {
    id: string;
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    type: StoreType;
    isActive: boolean;
    beatId: string;
    beat: Beat;
    visits: Visit[];
    lastVisitedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=store.model.d.ts.map