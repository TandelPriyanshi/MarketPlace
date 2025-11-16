import { Model } from 'sequelize-typescript';
import { Salesman } from './salesman.model';
import { Store } from './store.model';
export declare enum BeatStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    COMPLETED = "completed"
}
export declare class Beat extends Model {
    id: string;
    name: string;
    description: string;
    salesmanId: string;
    startDate: Date;
    endDate: Date;
    status: BeatStatus;
    route: {
        coordinates: Array<{
            lat: number;
            lng: number;
        }>;
        waypoints: Array<{
            storeId: string;
            order: number;
        }>;
    };
    salesman: Salesman;
    stores: Store[];
    created_at: Date;
    updatedAt: Date;
}
//# sourceMappingURL=beat.model.d.ts.map