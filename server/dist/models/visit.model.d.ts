import { Model } from 'sequelize-typescript';
import { Salesman } from './salesman.model';
import { Store } from './store.model';
export declare enum VisitStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Visit extends Model {
    id: string;
    salesmanId: string;
    storeId: string;
    status: VisitStatus;
    scheduledAt: Date;
    startedAt: Date;
    completedAt: Date;
    purpose: string;
    remarks: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    checkIn: {
        timestamp: Date;
        location: {
            latitude: number;
            longitude: number;
            address: string;
        };
        imageUrl?: string;
    };
    checkOut: {
        timestamp: Date;
        location: {
            latitude: number;
            longitude: number;
            address: string;
        };
        summary?: string;
    };
    salesman: Salesman;
    store: Store;
    created_at: Date;
    updatedAt: Date;
}
//# sourceMappingURL=visit.model.d.ts.map