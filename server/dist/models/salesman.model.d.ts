import { Model } from 'sequelize-typescript';
import { Beat } from './beat.model';
import { Visit } from './visit.model';
export declare class Salesman extends Model {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    beats?: Beat[];
    visits?: Visit[];
    lastActiveAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=salesman.model.d.ts.map